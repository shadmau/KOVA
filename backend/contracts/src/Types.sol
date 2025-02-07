// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;

enum RiskLevel {
    LOW,
    MEDIUM,
    HIGH
}

struct AgentData {
    string name;
    string description;
    string model;
    string userPromptURI;
    string systemPromptURI;
    bool promptsEncrypted;
    RiskLevel riskLevel;
    uint256 investmentAmount;
    address[] preferredAssets;
}
