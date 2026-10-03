package com.consentchain.aggregatorservice.service;

import com.consentchain.aggregatorservice.config.BlockchainProperties;
import com.consentchain.aggregatorservice.model.BlockchainConsentEventType;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import jakarta.annotation.PreDestroy;
import org.web3j.abi.FunctionEncoder;
import org.web3j.abi.FunctionReturnDecoder;
import org.web3j.abi.TypeReference;
import org.web3j.abi.datatypes.Bool;
import org.web3j.abi.datatypes.generated.Bytes32;
import org.web3j.abi.datatypes.Function;
import org.web3j.abi.datatypes.Type;
import org.web3j.abi.datatypes.generated.Uint8;
import org.web3j.abi.datatypes.generated.Uint64;
import org.web3j.crypto.Credentials;
import org.web3j.crypto.RawTransaction;
import org.web3j.crypto.TransactionEncoder;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.DefaultBlockParameterName;
import org.web3j.protocol.core.methods.request.Transaction;
import org.web3j.protocol.http.HttpService;
import org.web3j.utils.Numeric;

import java.math.BigInteger;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Service
@ConditionalOnProperty(prefix = "blockchain", name = "enabled", havingValue = "true")
public class BesuBlockchainClient implements BlockchainClient {
    private final Web3j web3j;
    private final Credentials credentials;
    private final BlockchainProperties properties;

    public BesuBlockchainClient(BlockchainProperties properties) {
        this.properties = properties;
        if (properties.getPrivateKey() == null || properties.getPrivateKey().isBlank()) {
            throw new IllegalStateException("BLOCKCHAIN_PRIVATE_KEY is required when blockchain is enabled");
        }
        if (properties.getContractAddress() == null || !properties.getContractAddress().matches("0x[0-9a-fA-F]{40}")) {
            throw new IllegalStateException("BLOCKCHAIN_CONTRACT_ADDRESS must be a deployed 20-byte address");
        }
        this.web3j = Web3j.build(new HttpService(properties.getRpcUrl()));
        this.credentials = Credentials.create(properties.getPrivateKey());
    }

    @Override
    public String submitEvent(String eventKey, BlockchainConsentEventType eventType, String consentReference, String commitmentHash) {
        try {
            if (isEventRecorded(eventKey)) return "ALREADY_RECORDED";
            Function function = new Function("recordEvent",
                    Arrays.asList(bytes32(eventKey), new Uint8(BigInteger.valueOf(eventType.getContractValue())), bytes32(consentReference), bytes32(commitmentHash)),
                    Collections.emptyList());
            String data = FunctionEncoder.encode(function);
            BigInteger nonce = web3j.ethGetTransactionCount(credentials.getAddress(), DefaultBlockParameterName.PENDING).send().getTransactionCount();
            RawTransaction transaction = RawTransaction.createTransaction(nonce, BigInteger.valueOf(properties.getGasPriceWei()),
                    BigInteger.valueOf(properties.getGasLimit()), properties.getContractAddress(), BigInteger.ZERO, data);
            byte[] signed = TransactionEncoder.signMessage(transaction, properties.getChainId(), credentials);
            String raw = Numeric.toHexString(signed);
            var response = web3j.ethSendRawTransaction(raw).send();
            if (response.hasError()) throw new IllegalStateException(response.getError().getMessage());
            String transactionHash = response.getTransactionHash();
            for (int attempt = 0; attempt < 60; attempt++) {
                var receipt = web3j.ethGetTransactionReceipt(transactionHash).send().getTransactionReceipt();
                if (receipt.isPresent()) {
                    if (!"0x1".equalsIgnoreCase(receipt.get().getStatus())) {
                        throw new IllegalStateException("Besu transaction was mined but reverted");
                    }
                    return transactionHash;
                }
                Thread.sleep(500);
            }
            throw new IllegalStateException("Timed out waiting for a Besu block confirmation");
        } catch (Exception e) {
            throw new IllegalStateException("Could not submit consent audit event to Besu: " + e.getMessage(), e);
        }
    }

    @Override
    public boolean isEventRecorded(String eventKey) {
        try {
            Function function = new Function("hasEvent", List.of(bytes32(eventKey)), List.of(new TypeReference<Bool>() {}));
            String data = FunctionEncoder.encode(function);
            var response = web3j.ethCall(Transaction.createEthCallTransaction(credentials.getAddress(), properties.getContractAddress(), data), DefaultBlockParameterName.LATEST).send();
            if (response.hasError()) throw new IllegalStateException(response.getError().getMessage());
            List<Type> decoded = FunctionReturnDecoder.decode(response.getValue(), function.getOutputParameters());
            return !decoded.isEmpty() && ((Bool) decoded.get(0)).getValue();
        } catch (Exception e) {
            throw new IllegalStateException("Could not verify consent audit event on Besu: " + e.getMessage(), e);
        }
    }

    @Override
    public boolean verifyEvent(String eventKey, BlockchainConsentEventType eventType, String consentReference, String commitmentHash) {
        try {
            Function function = new Function("getAuditRecord", List.of(bytes32(eventKey)), Arrays.asList(
                    new TypeReference<Bool>() {}, new TypeReference<Uint8>() {}, new TypeReference<Bytes32>() {},
                    new TypeReference<Bytes32>() {}, new TypeReference<Uint64>() {}));
            String data = FunctionEncoder.encode(function);
            var response = web3j.ethCall(Transaction.createEthCallTransaction(credentials.getAddress(), properties.getContractAddress(), data), DefaultBlockParameterName.LATEST).send();
            if (response.hasError()) throw new IllegalStateException(response.getError().getMessage());
            List<Type> decoded = FunctionReturnDecoder.decode(response.getValue(), function.getOutputParameters());
            if (decoded.size() != 5 || !((Bool) decoded.get(0)).getValue()) return false;
            int recordedType = ((Uint8) decoded.get(1)).getValue().intValue();
            String recordedReference = Numeric.toHexString(((Bytes32) decoded.get(2)).getValue());
            String recordedCommitment = Numeric.toHexString(((Bytes32) decoded.get(3)).getValue());
            return recordedType == eventType.getContractValue()
                    && recordedReference.equalsIgnoreCase(consentReference)
                    && recordedCommitment.equalsIgnoreCase(commitmentHash);
        } catch (Exception e) {
            throw new IllegalStateException("Could not verify consent audit event on Besu: " + e.getMessage(), e);
        }
    }

    @PreDestroy
    public void close() {
        web3j.shutdown();
    }

    private Bytes32 bytes32(String hex) {
        byte[] bytes = Numeric.hexStringToByteArray(hex);
        if (bytes.length != 32) throw new IllegalArgumentException("Expected a 32-byte blockchain identifier");
        return new Bytes32(bytes);
    }
}
