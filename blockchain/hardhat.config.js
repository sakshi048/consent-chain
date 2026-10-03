require("@nomicfoundation/hardhat-ethers");
require("@nomicfoundation/hardhat-chai-matchers");

const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
const accounts = privateKey ? [privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`] : [];

module.exports = {
  solidity: { version: "0.8.24", settings: { evmVersion: "paris" } },
  paths: { sources: "./contracts", tests: "./test", cache: "./cache", artifacts: "./artifacts" },
  networks: {
    besu: {
      url: process.env.BLOCKCHAIN_RPC_URL || "http://localhost:8545",
      chainId: Number(process.env.BLOCKCHAIN_CHAIN_ID || 1337),
      accounts
    }
  }
};
