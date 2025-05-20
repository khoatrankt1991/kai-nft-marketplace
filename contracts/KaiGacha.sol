// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract KaiGacha is Ownable {
    IERC1155 public kaiNft;
    IERC20 public kaiToken;
    uint256 public drawPrice;

    mapping(uint256 => uint256) public rewardChances; // tokenId => % chance


    constructor(address _kaiNft, address _kaiToken) Ownable(msg.sender) {
        kaiNft = IERC1155(_kaiNft);
        kaiToken = IERC20(_kaiToken);
    }

    // --------- EVENTS ----------
    event DrawResult(address indexed user, uint256 tokenId, bool success);
    event DrawFailed(address indexed user);
    event DrawPriceSet(uint256 newPrice);
    event RewardChanceSet(uint256 tokenId, uint256 chance);
    // ---------------------------

    function setDrawPrice(uint256 _price) external onlyOwner {
        drawPrice = _price;
        emit DrawPriceSet(_price);
    }

    function setRewardChance(uint256 tokenId, uint256 chance) external onlyOwner {
        rewardChances[tokenId] = chance;
        emit RewardChanceSet(tokenId, chance);
    }

    function luckyDraw() external {
        require(kaiToken.transferFrom(msg.sender, address(this), drawPrice), "Payment failed");

        uint256 rand = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, blockhash(block.number - 1)))) % 100;

        uint256 acc = 0;
        for (uint256 i = 1; i <= 3; i++) {
            acc += rewardChances[i];
            if (rand < acc) {
                kaiNft.safeTransferFrom(owner(), msg.sender, i, 1, "");
                emit DrawResult(msg.sender, i, true);
                return;
            }
        }

        // No prize won
        emit DrawResult(msg.sender, 0, false);
        emit DrawFailed(msg.sender);
    }
}
