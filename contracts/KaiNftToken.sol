// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title KaiNftToken
 * @dev ERC-1155 multi-token contract supporting both NFTs and fungible tokens (FTs),
 * with per-token metadata URIs. Only the contract owner can mint tokens and set their URIs.
 */
contract KaiNftToken is ERC1155, Ownable {
    /// @dev Mapping from token ID to token URI
    mapping(uint256 => string) private _tokenURIs;

    /**
     * @dev Constructor with empty base URI.
     * We override the `uri()` function to use per-token URIs instead.
     */
    constructor() ERC1155("") Ownable(msg.sender) {}

    /**
     * @notice Mint a new token (NFT or FT) to a specified address.
     * @dev Only the owner can mint. Use amount = 1 for NFT, amount > 1 for FT.
     * @param to Address to receive the minted token(s)
     * @param tokenId Unique token ID to mint
     * @param amount Quantity to mint (1 = NFT, >1 = FT)
     * @param uri_ Metadata URI for this tokenId (e.g., IPFS link)
     */
    function mint(
        address to,
        uint256 tokenId,
        uint256 amount,
        string memory uri_
    ) external onlyOwner {
        _mint(to, tokenId, amount, "");
        _setTokenURI(tokenId, uri_);
    }

    /**
     * @dev Internal function to set token URI for a given tokenId.
     * @param tokenId Token ID to set URI for
     * @param newuri New URI string
     */
    function _setTokenURI(uint256 tokenId, string memory newuri) internal {
        _tokenURIs[tokenId] = newuri;
    }

    /**
     * @notice Returns the metadata URI for a given token ID.
     * @dev Overrides the default ERC1155 `uri()` function.
     * @param tokenId Token ID to query
     * @return URI string
     */
    function uri(uint256 tokenId) public view override returns (string memory) {
        string memory tokenUri = _tokenURIs[tokenId];
        require(bytes(tokenUri).length > 0, "URI not set");
        return tokenUri;
    }

    /**
     * @notice Update the metadata URI of an existing token ID.
     * @dev Only owner can update. Useful for metadata upgrades or corrections.
     * @param tokenId Token ID to update
     * @param newUri New URI string
     */
    function updateTokenURI(uint256 tokenId, string memory newUri) external onlyOwner {
        require(bytes(_tokenURIs[tokenId]).length > 0, "Token does not exist");
        _tokenURIs[tokenId] = newUri;
    }
}
