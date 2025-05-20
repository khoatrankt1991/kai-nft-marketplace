// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
// import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
interface IKaiToken {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

interface IKaiNftToken {
    function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes calldata data) external;
}

contract KaiMarketplace1155 is ReentrancyGuard, ERC1155Holder {
    struct Listing {
        address seller;
        address nft;
        uint256 tokenId;
        uint256 amount;
        uint256 pricePerUnit;
    }

    mapping(uint256 => Listing) public listings;
    uint256 public nextListingId;

    address public feeRecipient;
    uint256 public feePercent; // e.g. 200 = 2%
    IKaiToken public kaiToken;

    event Listed(uint256 indexed listingId, address indexed seller, uint256 tokenId, uint256 amount, uint256 price);
    event Bought(uint256 indexed listingId, address indexed buyer, uint256 amount, uint256 totalPrice);
    event Cancelled(uint256 indexed listingId);

    constructor(address _kaiToken, address _feeRecipient, uint256 _feePercent) {
        require(_feePercent <= 10000, "fee too high");
        kaiToken = IKaiToken(_kaiToken);
        feeRecipient = _feeRecipient;
        feePercent = _feePercent;
    }

    function list(
        address nft,
        uint256 tokenId,
        uint256 amount,
        uint256 pricePerUnit
    ) external {
        require(amount > 0 && pricePerUnit > 0, "Invalid params");

        IKaiNftToken(nft).safeTransferFrom(msg.sender, address(this), tokenId, amount, "");

        listings[nextListingId] = Listing({
            seller: msg.sender,
            nft: nft,
            tokenId: tokenId,
            amount: amount,
            pricePerUnit: pricePerUnit
        });

        emit Listed(nextListingId, msg.sender, tokenId, amount, pricePerUnit);
        nextListingId++;
    }

    function buy(uint256 listingId, uint256 quantity) external nonReentrant {
        Listing storage l = listings[listingId];
        require(quantity > 0 && quantity <= l.amount, "Invalid quantity");

        uint256 totalPrice = l.pricePerUnit * quantity;
        uint256 fee = (totalPrice * feePercent) / 10000;
        uint256 sellerAmount = totalPrice - fee;

        // 🔐 Effects first
        address seller = l.seller;
        address nft = l.nft;
        uint256 tokenId = l.tokenId;

        l.amount -= quantity;
        if (l.amount == 0) {
            delete listings[listingId];
        }

        // 💸 Interactions last
        require(kaiToken.transferFrom(msg.sender, seller, sellerAmount), "pay seller failed");
        require(kaiToken.transferFrom(msg.sender, feeRecipient, fee), "pay fee failed");

        IKaiNftToken(nft).safeTransferFrom(address(this), msg.sender, tokenId, quantity, "");

        emit Bought(listingId, msg.sender, quantity, totalPrice);
    }


    function cancel(uint256 listingId) external nonReentrant {
        Listing storage l = listings[listingId];
        require(msg.sender == l.seller, "not seller");

        uint256 amount = l.amount;
        address nft = l.nft;
        uint256 tokenId = l.tokenId;

        delete listings[listingId];

        IKaiNftToken(nft).safeTransferFrom(address(this), msg.sender, tokenId, amount, "");

        emit Cancelled(listingId);
    }

}
