const { expect } = require("chai");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { ethers } = require("hardhat");

describe("ConsentAuditRegistry", function () {
  async function deploy() {
    const [writer, other] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("ConsentAuditRegistry");
    const contract = await Factory.deploy(writer.address);
    await contract.waitForDeployment();
    return { contract, writer, other };
  }

  it("records only the four allowed event types and exposes proof data", async function () {
    const { contract } = await deploy();
    const eventKey = ethers.keccak256(ethers.toUtf8Bytes("event-1"));
    const consentRef = ethers.keccak256(ethers.toUtf8Bytes("opaque-consent"));
    const commitment = ethers.keccak256(ethers.toUtf8Bytes("keyed-commitment"));
    for (const eventType of [0, 1, 2, 3]) {
      const key = ethers.keccak256(ethers.toUtf8Bytes(`event-${eventType}`));
      await expect(contract.recordEvent(key, eventType, consentRef, commitment))
        .to.emit(contract, "ConsentAuditRecorded").withArgs(key, consentRef, eventType, commitment, anyValue);
      expect(await contract.hasEvent(key)).to.equal(true);
      const record = await contract.getAuditRecord(key);
      expect(record.exists).to.equal(true);
      expect(record.eventType).to.equal(eventType);
      expect(record.commitmentHash).to.equal(commitment);
    }
  });

  it("rejects writes by anyone except the configured AA writer", async function () {
    const { contract, other } = await deploy();
    await expect(contract.connect(other).recordEvent(ethers.ZeroHash, 0, ethers.ZeroHash, ethers.ZeroHash))
      .to.be.revertedWith("writer only");
  });

  it("rejects unsupported event types and duplicate event keys", async function () {
    const { contract } = await deploy();
    const eventKey = ethers.keccak256(ethers.toUtf8Bytes("event-2"));
    const ref = ethers.keccak256(ethers.toUtf8Bytes("ref"));
    const hash = ethers.keccak256(ethers.toUtf8Bytes("hash"));
    await expect(contract.recordEvent(eventKey, 4, ref, hash)).to.be.revertedWith("invalid event type");
    await contract.recordEvent(eventKey, 0, ref, hash);
    await expect(contract.recordEvent(eventKey, 0, ref, hash)).to.be.revertedWith("event already recorded");
  });
});
