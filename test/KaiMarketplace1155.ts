import { expect } from "chai";
import { ethers } from "hardhat";
import { KAI, KaiNftToken, KaiMarketplace1155 } from "../typechain-types";

describe("KaiMarketplace1155", function () {
  let kaiToken: KAI;
  let kaiNFT: KaiNftToken;
  let marketplace: KaiMarketplace1155;
  let owner: any, seller: any, buyer: any, feeRecipient: any;

  const tokenId = 1;
  const pricePerUnit = ethers.parseUnits("100", 18);
  const feePercent = 200; // 2%

  beforeEach(async () => {
    [owner, seller, buyer, feeRecipient] = await ethers.getSigners();

    const KaiTokenContract = await ethers.getContractFactory("KAI");
    kaiToken = await KaiTokenContract.deploy();
    const kaiTokenAddress = await kaiToken.getAddress();

    const KaiNFTContract = await ethers.getContractFactory("KaiNftToken");
    kaiNFT = await KaiNFTContract.deploy();
    const kaiNFTAddress = await kaiNFT.getAddress();

    const MarketplaceContract = await ethers.getContractFactory("KaiMarketplace1155");
    marketplace = await MarketplaceContract.deploy(kaiTokenAddress, feeRecipient.address, feePercent);
    const marketplaceAddress = await marketplace.getAddress();

    // Mint NFT to seller
    await kaiNFT.mint(seller.address, tokenId, 10, "ipfs://sample-uri");
    await kaiNFT.connect(seller).setApprovalForAll(marketplaceAddress, true);

    // Mint KaiToken to buyer
    await kaiToken.transfer(buyer.address, ethers.parseUnits("1000", 18));
    await kaiToken.connect(buyer).approve(marketplaceAddress, ethers.parseUnits("1000", 18));
  });

  it("should allow seller to list NFT", async () => {
    await expect(
      marketplace.connect(seller).list(await kaiNFT.getAddress(), tokenId, 5, pricePerUnit)
    ).to.emit(marketplace, "Listed");

    const listing = await marketplace.listings(0);
    expect(listing.seller).to.equal(seller.address);
    expect(listing.amount).to.equal(5);
  });

  it("should allow buyer to buy NFT and split payment", async () => {
    await marketplace.connect(seller).list(await kaiNFT.getAddress(), tokenId, 5, pricePerUnit);

    const sellerBalBefore = await kaiToken.balanceOf(seller.address);
    const feeBalBefore = await kaiToken.balanceOf(feeRecipient.address);

    await expect(marketplace.connect(buyer).buy(0, 2))
      .to.emit(marketplace, "Bought");

    const sellerBalAfter = await kaiToken.balanceOf(seller.address);
    const feeBalAfter = await kaiToken.balanceOf(feeRecipient.address);
    const buyerNft = await kaiNFT.balanceOf(buyer.address, tokenId);

    const total = pricePerUnit * 2n;
    const fee = (total * BigInt(feePercent)) / 10000n;
    const sellerCut = total - fee;

    expect(sellerBalAfter -sellerBalBefore).to.equal(sellerCut);
    expect(feeBalAfter - feeBalBefore).to.equal(fee);
    expect(buyerNft).to.equal(2);
  });

  it("should revert if buyer buys too much", async () => {
    await marketplace.connect(seller).list(await kaiNFT.getAddress(), tokenId, 3, pricePerUnit);
    await expect(marketplace.connect(buyer).buy(0, 10)).to.be.revertedWith("Invalid quantity");
  });

  it("should allow seller to cancel listing", async () => {
    await marketplace.connect(seller).list(await kaiNFT.getAddress(), tokenId, 4, pricePerUnit);

    await expect(marketplace.connect(seller).cancel(0))
      .to.emit(marketplace, "Cancelled");

    const balance = await kaiNFT.balanceOf(seller.address, tokenId);
    expect(balance).to.equal(10); // đã lấy lại NFT
  });

  it("should not allow other users to cancel listing", async () => {
    await marketplace.connect(seller).list(await kaiNFT.getAddress(), tokenId, 3, pricePerUnit);
    await expect(marketplace.connect(buyer).cancel(0)).to.be.revertedWith("not seller");
  });

  it("should delete listing when amount = 0", async () => {
    await marketplace.connect(seller).list(await kaiNFT.getAddress(), tokenId, 2, pricePerUnit);
    await marketplace.connect(buyer).buy(0, 2);
    const listing = await marketplace.listings(0);
    expect(listing.amount).to.equal(0);
  });
});
