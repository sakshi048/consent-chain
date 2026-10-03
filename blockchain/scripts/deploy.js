const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  if (!deployer) throw new Error("Set DEPLOYER_PRIVATE_KEY to a funded local Besu account");
  const factory = await hre.ethers.getContractFactory("ConsentAuditRegistry");
  const contract = await factory.deploy(deployer.address);
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  console.log(`ConsentAuditRegistry deployed: ${address}`);
  console.log(`Writer address: ${deployer.address}`);
  console.log(`Set BLOCKCHAIN_CONTRACT_ADDRESS=${address} in aggregator-service environment`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
