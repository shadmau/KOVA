// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "./AgentNFT.sol";
import "./Types.sol";

contract AIAgentRoom is IERC721Receiver {
    uint256 public constant MAX_AGENTS = 2;
    AgentNFT public immutable agentNft;

    mapping(uint256 => uint256[]) public roomAgents;

    mapping(uint256 => mapping(uint256 => address)) public roomParticipants;
    uint256 public nextRoomId;

    event RoomCreated(uint256 roomId, uint256 agentId);
    event RoomJoined(uint256 roomId, uint256 agentId);
    event RoomLeft(uint256 roomId, uint256 agentId);

    constructor(address _agentNft) {
        agentNft = AgentNFT(_agentNft);
    }

    function createRoom(uint256 agentId) external returns (uint256 roomId) {
        require(agentNft.ownerOf(agentId) == msg.sender, "Not agent owner");

        (AgentType agentType, , , ) = agentNft.getAgentExtraData(agentId);
        require(agentType == AgentType.Trader, "Only Trader can create room");

        roomId = nextRoomId;
        nextRoomId++;
        agentNft.safeTransferFrom(msg.sender, address(this), agentId);

        roomAgents[roomId].push(agentId);
        roomParticipants[roomId][agentId] = msg.sender;

        emit RoomCreated(roomId, agentId);
    }

    function joinRoom(uint256 roomId, uint256 agentId) external {
        require(roomAgents[roomId].length > 0, "Invalid roomId");
        require(agentNft.ownerOf(agentId) == msg.sender, "Not agent owner");

        (AgentType agentType, , , ) = agentNft.getAgentExtraData(agentId);
        require(agentType == AgentType.Investor, "Only Investor can join room");

        require(roomAgents[roomId].length < MAX_AGENTS, "Max agents in room");

        agentNft.safeTransferFrom(msg.sender, address(this), agentId);

        roomAgents[roomId].push(agentId);
        roomParticipants[roomId][agentId] = msg.sender;

        emit RoomJoined(roomId, agentId);
    }

    function leaveRoom(uint256 roomId, uint256 agentId) external {
        require(
            roomParticipants[roomId][agentId] == msg.sender,
            "Not depositor"
        );
        roomParticipants[roomId][agentId] = address(0);

        uint256[] storage agents = roomAgents[roomId];
        uint256 length = agents.length;

        for (uint256 i = 0; i < length; i++) {
            if (agents[i] == agentId) {
                agents[i] = agents[length - 1];
                agents.pop();
                break; 
            }
        }

        agentNft.safeTransferFrom(address(this), msg.sender, agentId);

        emit RoomLeft(roomId, agentId);
    }

    function getAgentsInRoom(
        uint256 roomId
    ) external view returns (uint256[] memory) {
        return roomAgents[roomId];
    }

    function viewRoomStatus(uint256 roomId) external view returns (RoomStatus) {
        uint256 count = roomAgents[roomId].length;
        if (count == 0) {
            return RoomStatus.Closed;
        } else if (count < MAX_AGENTS) {
            return RoomStatus.Open;
        } else {
            return RoomStatus.InProgress;
        }
    }

    function onERC721Received(
        address,
        address,
        uint256,
        bytes memory
    ) external pure returns (bytes4) {
        return this.onERC721Received.selector;
    }
}
