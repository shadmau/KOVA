// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;

import {AgentNFT} from "./AgentNFT.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC721Receiver} from "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import {EnumerableMap} from "@openzeppelin/contracts/utils/structs/EnumerableMap.sol";

contract AgentRoom is IERC721Receiver {
error AgentRoom__MaxAgentsExceeded();
error AgentRoom__OnlyOwnerCanCreateRoom();
error AgentRoom__OnlyTraderCanCreateRoom();
error AgentRoom__OnlyInvestorsCanJoinRoom();
error AgentRoom__OnlyOwnerCanLeaveRoom();

enum RoomStatus {
    Open,
    Closed,
    InProgress
}



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

enum RiskLevel {
    LOW,
    MEDIUM,
    HIGH
}


event AgentCreated(uint256 agentID, AgentData agentData);

// AgentRoom
event RoomCreated(uint256 roomId, uint8 roomType, uint256 agentID);

event RoomFull(uint256 roomId, uint8 roomType, uint256[] agentIDs);

event RoomJoined(uint256 roomId, uint8 roomType, uint256 agentID);

event RoomLeft(uint256 roomId, uint8 roomType, uint256 agentID);
    using EnumerableMap for EnumerableMap.UintToUintMap;

    uint256 private constant MAX_AGENTS = 2;
    AgentNFT private constant AGENTNFT =
        AgentNFT(0xEF78E7D23A02a404D348a0f37ac0fF4D10991D1a);

    // Storage
    EnumerableMap.UintToUintMap agentRooms;
    mapping(uint256 => EnumerableMap.UintToUintMap) roomAgents2;
    // roomId => agentIDs
    mapping(uint256 => uint256[]) roomAgents;
    // agentID => roomIdPosition
    mapping(uint256 => uint256) agentRoomPosition;
    mapping(uint256 => mapping(uint256 => address)) roomParticipants;
    uint256 roomIdCount;

    function createRoom(
        uint256 agentID
    ) external returns (uint256 roomId_) {
      return 0;
    }

    function joinRoom(uint256 roomId, uint256 agentID) public {
       
    }

    function leaveRoom(uint256 roomId, uint8 roomType, uint256 agentID) public {
        if (roomParticipants[agentID][roomId] != msg.sender) revert AgentRoom__OnlyOwnerCanLeaveRoom();
        roomParticipants[agentID][roomId] = address(0);

        AGENTNFT.safeTransferFrom(address(this), msg.sender, agentID);
        emit RoomLeft(roomId, roomType, agentID);
    }

    function getRoomParticipant(uint256 roomId) public view returns (uint256) {
        return
            roomAgents2[roomId].get(roomId);
    }

    function getRoomParticipants(
        uint256 roomId
    ) public view returns (uint256[] memory) {
        return roomAgents[roomId];
    }

    function getAllRoomParticipants(
        uint256 roomId
    ) public view returns (uint256[] memory agentIDs) {
        uint256 agentRoomLength = roomAgents2[roomId]
            .length();
        for (uint256 i; i < agentRoomLength; ) {
            agentIDs[i] = roomAgents2[roomId]
                .get(i);
            unchecked {
                ++i;
            }
        }
    }

    function viewAgentRoomStatus(
        uint256 roomId
    ) public view returns (RoomStatus) {
        uint256 agentRoomLength = roomAgents2[roomId]
            .length();
        if (agentRoomLength == MAX_AGENTS) {
            return RoomStatus.InProgress;
        } else if (agentRoomLength == 1) {
            return RoomStatus.Open;
        } else {
            return RoomStatus.Closed;
        }
    }

    /**
     * @dev See {IERC721Receiver-onERC721Received}.
     *
     * Always returns `IERC721Receiver.onERC721Received.selector`.
     */
    function onERC721Received(
        address,
        address,
        uint256,
        bytes memory
    ) public virtual returns (bytes4) {
        return this.onERC721Received.selector;
    }
}
