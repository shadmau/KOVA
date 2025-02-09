// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;

struct AgentData {
    string name;
    string description;
    string model;
    string userPromptURI;
    string systemPromptURI;
    bool promptsEncrypted;
    AgentType agentType;
    RiskLevel riskLevel;
    uint256 investmentAmount;
    address[] preferredAssets;
}

enum AgentType {
    Trader,
    Investor
}

enum RoomStatus {
    Open,
    Closed,
    InProgress
}

enum RiskLevel {
    LOW,
    MEDIUM,
    HIGH
}
