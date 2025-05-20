import { expect } from "chai";
import { ethers } from "hardhat";
import { KaiMarketplace1155, ReentrancyAttack, KaiNftToken, KAI } from "../typechain-types";

describe("KaiMarketplace1155 Reentrancy Protection", function () {
  let kaiToken: KAI;
  let kaiNFT: KaiNftToken;
  let marketplace: KaiMarketplace1155;
  let attacker: any;
  let seller: any;
  let feeRecipient: any;
  let attackerContract: ReentrancyAttack;

  const tokenId = 1;
  const feePercent = 200;
  const price = ethers.parseUnits("100", 18);

  beforeEach(async () => {
    [attacker, seller, feeRecipient] = await ethers.getSigners();

    const KaiTokenContract = await ethers.getContractFactory("KAI");
    kaiToken = await KaiTokenContract.deploy();
    const kaiTokenAddress = await kaiToken.getAddress();
    const KaiNFTContract = await ethers.getContractFactory("KaiNftToken");
    kaiNFT = await KaiNFTContract.deploy();
    const kaiNFTAddress = await kaiNFT.getAddress();

    const MarketplaceContract = await ethers.getContractFactory("KaiMarketplace1155");
    marketplace = await MarketplaceContract.deploy(kaiTokenAddress, feeRecipient.address, feePercent);
    const marketplaceAddress = await marketplace.getAddress();

    // Mint NFT to seller and approve
    await kaiNFT.mint(seller.address, tokenId, 5, "ipfs://uri");
    await kaiNFT.connect(seller).setApprovalForAll(marketplaceAddress, true);

    // List 5 NFT
    await marketplace.connect(seller).list(kaiNFTAddress, tokenId, 5, price);

    // Deploy malicious contract
    const ReentrancyAttack = await ethers.getContractFactory("ReentrancyAttack");
    attackerContract = await ReentrancyAttack.deploy(marketplaceAddress);
  });

  it("should block reentrancy via attack contract", async () => {
    await expect(
      attackerContract.attackReentrancy()
    ).to.be.revertedWithCustomError(kaiToken, "ERC20InsufficientAllowance");
  });
});
