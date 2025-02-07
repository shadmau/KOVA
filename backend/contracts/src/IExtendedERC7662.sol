// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {RiskLevel} from "./Types.sol";

interface IExtendedERC7662 is IERC721 {
    function getAgentData(uint256 tokenId)
        external
        view
        returns (
            string memory name,
            string memory description,
            string memory model,
            string memory userPromptURI,
            string memory systemPromptURI,
            bool promptsEncrypted,
            RiskLevel riskLevel,
            uint256 investmentAmount,
            address[] memory preferredAssets
        );

    event AgentUpdated(uint256 indexed tokenId);
}
