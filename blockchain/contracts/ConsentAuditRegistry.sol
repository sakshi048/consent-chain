// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Stores keyed commitments for AA consent lifecycle events. No personal or financial data is stored here.
contract ConsentAuditRegistry {
    address public immutable writer;

    struct AuditRecord {
        bool exists;
        uint8 eventType; // CREATED=0, APPROVED=1, REJECTED=2, REVOKED=3
        bytes32 consentReference;
        bytes32 commitmentHash;
        uint64 recordedAt;
    }

    mapping(bytes32 => AuditRecord) private records;

    event ConsentAuditRecorded(
        bytes32 indexed eventKey,
        bytes32 indexed consentReference,
        uint8 eventType,
        bytes32 commitmentHash,
        uint64 recordedAt
    );

    constructor(address initialWriter) {
        require(initialWriter != address(0), "writer required");
        writer = initialWriter;
    }

    function recordEvent(bytes32 eventKey, uint8 eventType, bytes32 consentReference, bytes32 commitmentHash) external {
        require(msg.sender == writer, "writer only");
        require(eventType <= 3, "invalid event type");
        require(eventKey != bytes32(0) && consentReference != bytes32(0) && commitmentHash != bytes32(0), "empty audit field");
        require(!records[eventKey].exists, "event already recorded");

        uint64 at = uint64(block.timestamp);
        records[eventKey] = AuditRecord(true, eventType, consentReference, commitmentHash, at);
        emit ConsentAuditRecorded(eventKey, consentReference, eventType, commitmentHash, at);
    }

    function hasEvent(bytes32 eventKey) external view returns (bool) {
        return records[eventKey].exists;
    }

    function getAuditRecord(bytes32 eventKey) external view returns (bool exists, uint8 eventType, bytes32 consentReference, bytes32 commitmentHash, uint64 recordedAt) {
        AuditRecord memory record = records[eventKey];
        return (record.exists, record.eventType, record.consentReference, record.commitmentHash, record.recordedAt);
    }
}
