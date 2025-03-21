// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import {Agent} from "src/Agent.sol";
import {IERC7662} from "src/interfaces/IERC7662.sol";
import {AgentData} from "src/structs.sol";

contract AgentTest is Test {
    Agent public agentContract;
    address public owner = address(1);
    address public user = address(3);
    address public owner_invalid = address(4);

    function setUp() public {
        vm.startPrank(owner);
        agentContract = new Agent();
        agentContract.setBaseURI("https://example.com/tokens/");
        vm.stopPrank();
    }

    function test_Deployment() public view {
        assertEq(agentContract.owner(), owner, "Owner should be set correctly");
        assertEq(agentContract.name(), "KOVA AI Agent", "Token name should be Agent");
        assertEq(agentContract.symbol(), "AGNT", "Token symbol should be AGENT");
        assertEq(agentContract.baseTokenURI(), "https://example.com/tokens/", "Base token URI should be set correctly");
    }

    function test_Mint() public {
        AgentData memory data = AgentData({
            name: "TestAgent",
            description: "A test agent",
            model: "LLAMA-3.1-8B-Instruct",
            userPromptURI: "ipfs://user",
            systemPromptURI: "ipfs://system",
            promptsEncrypted: true
        });

        vm.prank(user);
        agentContract.mint(user, data);

        assertEq(agentContract.ownerOf(0), user, "Token owner should be user");
        assertEq(agentContract.balanceOf(user), 1, "Total supply should be 1");

        (
            string memory name,
            string memory description,
            string memory model,
            string memory userPromptURI,
            string memory systemPromptURI,
            bool promptsEncrypted
        ) = agentContract.getAgentData(0);

        assertEq(name, data.name, "Name mismatch");
        assertEq(description, data.description, "Description mismatch");
        assertEq(model, data.model, "Model mismatch");
        assertEq(userPromptURI, data.userPromptURI, "UserPromptURI mismatch");
        assertEq(systemPromptURI, data.systemPromptURI, "SystemPromptURI mismatch");
        assertEq(promptsEncrypted, data.promptsEncrypted, "PromptsEncrypted mismatch");

        assertEq(agentContract.tokenURI(0), "https://example.com/tokens/0", "Token URI mismatch");
    }

    function test_UpdateAgentData() public {
        vm.startPrank(user);

        AgentData memory data_inital = AgentData({
            name: "TestAgent",
            description: "A test agent",
            model: "LLAMA-3.1-8B-Instruct",
            userPromptURI: "ipfs://user",
            systemPromptURI: "ipfs://system",
            promptsEncrypted: true
        });

        agentContract.mint(user, data_inital);

        AgentData memory data_updated = AgentData({
            name: "TestAgent_2",
            description: "A test agent_2",
            model: "LLAMA-3.1-8B-Instruct_2",
            userPromptURI: "ipfs://user_2",
            systemPromptURI: "ipfs://system_2",
            promptsEncrypted: true
        });

        agentContract.updateAgentData(0, data_updated);

        (
            string memory name,
            string memory description,
            string memory model,
            string memory userPromptURI,
            string memory systemPromptURI,
            bool promptsEncrypted
        ) = agentContract.getAgentData(0);
        assertEq(name, data_updated.name, "Name mismatch");
        assertEq(description, data_updated.description, "Description mismatch");
        assertEq(model, data_updated.model, "Model mismatch");
        assertEq(userPromptURI, data_updated.userPromptURI, "UserPromptURI mismatch");
        assertEq(systemPromptURI, data_updated.systemPromptURI, "SystemPromptURI mismatch");
        assertEq(promptsEncrypted, data_updated.promptsEncrypted, "PromptsEncrypted mismatch");

        vm.stopPrank();

        vm.startPrank(owner_invalid);
        vm.expectRevert("Only agent owner can update agent data");
        agentContract.updateAgentData(0, data_updated);
    }
}
