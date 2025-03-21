// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.28;

struct AgentData {
    string name;
    string description;
    string model;
    string userPromptURI;
    string systemPromptURI;
    bool promptsEncrypted;
}
