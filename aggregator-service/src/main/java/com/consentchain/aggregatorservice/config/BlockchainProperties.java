package com.consentchain.aggregatorservice.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import jakarta.annotation.PostConstruct;

@ConfigurationProperties(prefix = "blockchain")
public class BlockchainProperties {
    private boolean enabled = false;
    private String rpcUrl = "http://localhost:8545";
    private long chainId = 1337;
    private String contractAddress = "";
    private String privateKey = "";
    private String auditHmacSecret = "";
    private long pollDelayMs = 5000;
    private long gasPriceWei = 1000000000L;
    private long gasLimit = 300000L;

    @PostConstruct
    void validate() {
        if (enabled && (auditHmacSecret == null || auditHmacSecret.length() < 32)) {
            throw new IllegalStateException("BLOCKCHAIN_AUDIT_HMAC_SECRET must contain at least 32 characters when blockchain is enabled");
        }
    }

    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
    public String getRpcUrl() { return rpcUrl; }
    public void setRpcUrl(String rpcUrl) { this.rpcUrl = rpcUrl; }
    public long getChainId() { return chainId; }
    public void setChainId(long chainId) { this.chainId = chainId; }
    public String getContractAddress() { return contractAddress; }
    public void setContractAddress(String contractAddress) { this.contractAddress = contractAddress; }
    public String getPrivateKey() { return privateKey; }
    public void setPrivateKey(String privateKey) { this.privateKey = privateKey; }
    public String getAuditHmacSecret() { return auditHmacSecret; }
    public void setAuditHmacSecret(String auditHmacSecret) { this.auditHmacSecret = auditHmacSecret; }
    public long getPollDelayMs() { return pollDelayMs; }
    public void setPollDelayMs(long pollDelayMs) { this.pollDelayMs = pollDelayMs; }
    public long getGasPriceWei() { return gasPriceWei; }
    public void setGasPriceWei(long gasPriceWei) { this.gasPriceWei = gasPriceWei; }
    public long getGasLimit() { return gasLimit; }
    public void setGasLimit(long gasLimit) { this.gasLimit = gasLimit; }
}
