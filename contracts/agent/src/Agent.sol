// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {IERC165} from "@openzeppelin/contracts/interfaces/IERC165.sol";
import {IERC7662} from "./interfaces/IERC7662.sol";
import {AgentData} from "./structs.sol";

contract Agent is Ownable, ERC721, IERC7662 {
    uint256 public nextTokenId;
    string public baseTokenURI;

    mapping(uint256 => AgentData) public agentData;
    

    constructor() ERC721("KOVA AI Agent", "AGNT") Ownable(msg.sender) {}

    /**
     * @notice Public minting function.
     * @param recipient The address to receive the Agent NFT.
     * @param _agentData User-defined agent data (ERC-7662 standard).
     */
    function mint(address recipient, AgentData memory _agentData) external {
        uint256 tokenId = nextTokenId++;
        _mint(recipient, tokenId);
        agentData[tokenId] = _agentData;
        emit AgentUpdated(tokenId);
    }

    /**
     * @notice Update the agent data for a specific token ID.
     * @param tokenId The token ID to update.
     * @param _agentData The new agent data to set.
     */
    function updateAgentData(uint256 tokenId, AgentData memory _agentData) external {
        require(ownerOf(tokenId) == msg.sender, "Only agent owner can update agent data");
        agentData[tokenId] = _agentData;
        emit AgentUpdated(tokenId);
    }

    /**
     * @notice Set the base URI for tokenURI.
     * @param baseURI The base URI to set.
     */
    function setBaseURI(string memory baseURI) public onlyOwner {
        baseTokenURI = baseURI;
    }

    /**
     * @notice ERC-7662 standard getter for user-controlled agent data.
     * @param tokenId The token ID to retrieve agent data for.
     */
    function getAgentData(uint256 tokenId)
        external
        view
        override
        returns (
            string memory name,
            string memory description,
            string memory model,
            string memory userPromptURI,
            string memory systemPromptURI,
            bool promptsEncrypted
        )
    {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        AgentData memory data = agentData[tokenId];
        return
            (data.name, data.description, data.model, data.userPromptURI, data.systemPromptURI, data.promptsEncrypted);
    }

    /**
     * @notice Internal override returning the base URI for tokenURI.
     *         tokenURI = baseURI + tokenId
     */
    function _baseURI() internal view virtual override returns (string memory) {
        return baseTokenURI;
    }
}
