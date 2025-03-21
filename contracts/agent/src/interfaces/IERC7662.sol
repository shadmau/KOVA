// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";

interface IERC7662 is IERC721 {
    function getAgentData(uint256 tokenId)
        external
        view
        returns (
            string memory name,
            string memory description,
            string memory model,
            string memory userPromptURI,
            string memory systemPromptURI,
            bool promptsEncrypted
        );

    event AgentUpdated(uint256 indexed tokenId);
}