// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {IERC165} from "@openzeppelin/contracts/interfaces/IERC165.sol";
import {IExtendedERC7662} from "./IExtendedERC7662.sol";
import "./Types.sol";

contract AgentNFT is ERC721, ERC721Enumerable, ERC721URIStorage, IExtendedERC7662 {
    mapping(uint256 => AgentData) public agentData;

    constructor() ERC721("AgentNFT", "KOVA") {}

    function mint(AgentData memory _agentData, string memory _imageURI) external {
        uint256 currentTokenId = totalSupply() + 1;
        _mint(msg.sender, currentTokenId);
        agentData[currentTokenId] = _agentData;
        _setTokenURI(currentTokenId, _imageURI);
    }

    function _update(address to, uint256 tokenId, address auth)
        internal
        virtual
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        address previousOwner = ERC721Enumerable._update(to, tokenId, auth);
        return previousOwner;
    }

    function _increaseBalance(address account, uint128 amount) internal virtual override(ERC721, ERC721Enumerable) {
        ERC721Enumerable._increaseBalance(account, amount);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721, ERC721Enumerable, ERC721URIStorage, IERC165)
        returns (bool)
    {
        return interfaceId == type(IExtendedERC7662).interfaceId || interfaceId == type(IERC165).interfaceId
            || ERC721.supportsInterface(interfaceId) || ERC721Enumerable.supportsInterface(interfaceId)
            || ERC721URIStorage.supportsInterface(interfaceId) || super.supportsInterface(interfaceId);
    }

    function tokenURI(uint256 tokenId) public view virtual override(ERC721, ERC721URIStorage) returns (string memory) {}

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
            bool promptsEncrypted,
            RiskLevel riskLevel,
            uint256 investmentAmount,
            address[] memory preferredAssets
        )
    {
        AgentData memory agentData_ = agentData[tokenId];
        return (
            agentData_.name,
            agentData_.description,
            agentData_.model,
            agentData_.userPromptURI,
            agentData_.systemPromptURI,
            agentData_.promptsEncrypted,
            agentData_.riskLevel,
            agentData_.investmentAmount,
            agentData_.preferredAssets
        );
    }
}
