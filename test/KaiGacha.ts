import { expect } from "chai";
import { ethers } from "hardhat";
import { KAI, KaiNftToken, KaiGacha } from "../typechain-types";

// owner() have to setApprovalForAll() cho kaiGacha
describe("KaiGacha", function () {
  let kaiToken: KAI;
  let kaiNft: KaiNftToken;
  let kaiGacha: KaiGacha;
  let owner: any, user: any;

  const drawPrice = ethers.parseUnits("100", 18);
  const tokenId1 = 1;

  beforeEach(async () => {
    [owner, user] = await ethers.getSigners();

    const KaiTokenContract = await ethers.getContractFactory("KAI");
    kaiToken = await KaiTokenContract.deploy();
    const kaiTokenAddress = await kaiToken.getAddress();
    const KaiNftTokenContract = await ethers.getContractFactory("KaiNftToken");
    kaiNft = await KaiNftTokenContract.deploy();
    const kaiNftAddress = await kaiNft.getAddress();

    const KaiGachaContract = await ethers.getContractFactory("KaiGacha");
    kaiGacha = await KaiGachaContract.deploy(kaiNftAddress, kaiTokenAddress)
    const kaiGachaAddress = await kaiGacha.getAddress();
    // Mint NFT to owner
    await kaiNft.mint(owner.address, tokenId1, 10, "ipfs://token1");
    // owner() have to setApprovalForAll() cho kaiGacha
    await kaiNft.setApprovalForAll(kaiGachaAddress, true);

    // Transfer token to user
    await kaiToken.transfer(user.address, ethers.parseUnits("1000", 18));

    // Set price & chance
    await expect(kaiGacha.setDrawPrice(drawPrice))
      .to.emit(kaiGacha, "DrawPriceSet")
      .withArgs(drawPrice);

    await expect(kaiGacha.setRewardChance(tokenId1, 100))
      .to.emit(kaiGacha, "RewardChanceSet")
      .withArgs(tokenId1, 100);
  });

  it("should emit DrawResult on success", async () => {
    await kaiToken.connect(user).approve(await kaiGacha.getAddress(), drawPrice);

    await expect(kaiGacha.connect(user).luckyDraw())
      .to.emit(kaiGacha, "DrawResult")
      .withArgs(user.address, tokenId1, true);
  });

  it("should emit DrawFailed if user draws but gets nothing", async () => {
    // Setup tokenId1 chance = 0
    await kaiGacha.setRewardChance(tokenId1, 0);
    await kaiToken.connect(user).approve(await kaiGacha.getAddress(), drawPrice);

    await expect(kaiGacha.connect(user).luckyDraw())
      .to.emit(kaiGacha, "DrawResult")
      .withArgs(user.address, 0, false)
      .and.to.emit(kaiGacha, "DrawFailed")
      .withArgs(user.address);
  });

  it("should deduct KaiToken from user", async () => {
    await kaiToken.connect(user).approve(await kaiGacha.getAddress(), drawPrice);
    const before = await kaiToken.balanceOf(user.address);

    await kaiGacha.connect(user).luckyDraw();

    const after = await kaiToken.balanceOf(user.address);
    expect(before -after).to.equal(drawPrice);
  });

  it("should revert if KaiToken not approved", async () => {
    await expect(
      kaiGacha.connect(user).luckyDraw()
    ).to.be.revertedWithCustomError(kaiToken, "ERC20InsufficientAllowance");
  });

  it("should allow only owner to set config", async () => {
    await expect(
      kaiGacha.connect(user).setDrawPrice(drawPrice * 2n)
    ).to.be.revertedWithCustomError(kaiGacha, "OwnableUnauthorizedAccount");

    await expect(
      kaiGacha.connect(user).setRewardChance(tokenId1, 50)
    ).to.be.revertedWithCustomError(kaiGacha, "OwnableUnauthorizedAccount");
  });
});
