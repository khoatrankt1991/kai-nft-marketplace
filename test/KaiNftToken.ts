import { expect } from "chai";
import { ethers } from "hardhat";
import { KaiNftToken } from "../typechain-types";

describe("KaiNftToken", function () {
  let kaiNftToken: KaiNftToken;
  let owner: any;
  let user: any;

  const tokenIdNFT = 1;
  const tokenIdFT = 1001;
  const nftUri = "ipfs://nft-uri";
  const ftUri = "ipfs://ft-uri";

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();

    const KaiNftTokenContract = await ethers.getContractFactory("KaiNftToken");
    kaiNftToken = await KaiNftTokenContract.deploy();
  });

  it("should allow only owner to mint", async function () {
    await expect(
        kaiNftToken.connect(user).mint(user.address, tokenIdNFT, 1, nftUri)
    ).to.be.revertedWithCustomError(kaiNftToken, "OwnableUnauthorizedAccount");

    await expect(
        kaiNftToken.connect(owner).mint(user.address, tokenIdNFT, 1, nftUri)
    ).to.emit(kaiNftToken, "TransferSingle");
  });

  it("should mint an NFT and return correct URI", async function () {
    await kaiNftToken.mint(user.address, tokenIdNFT, 1, nftUri);

    const uri = await kaiNftToken.uri(tokenIdNFT);
    expect(uri).to.equal(nftUri);
  });

  it("should mint a FT and return correct URI", async function () {
    await kaiNftToken.mint(user.address, tokenIdFT, 1000, ftUri);

    const uri = await kaiNftToken.uri(tokenIdFT);
    expect(uri).to.equal(ftUri);
  });

  it("should not return URI for tokenId that hasn't been minted", async function () {
    await expect(kaiNftToken.uri(999)).to.be.revertedWith("URI not set");
  });

  it("should allow owner to update URI", async function () {
    await kaiNftToken.mint(user.address, tokenIdNFT, 1, nftUri);

    const newUri = "ipfs://new-nft-uri";
    await kaiNftToken.updateTokenURI(tokenIdNFT, newUri);

    const updatedUri = await kaiNftToken.uri(tokenIdNFT);
    expect(updatedUri).to.equal(newUri);
  });

  it("should revert when updating URI of non-existent token", async function () {
    await expect(
        kaiNftToken.updateTokenURI(tokenIdFT, ftUri)
    ).to.be.revertedWith("Token does not exist");
  });
});
