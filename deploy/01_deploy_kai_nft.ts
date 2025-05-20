import { HardhatRuntimeEnvironment } from "hardhat/types";
import hre from 'hardhat'

/**
 * 
 * @param hre 
 */
// npx hardhat verify --network sepolia 0x4Fb7619c7BDE8Dd4fd308A6CfC6a794e1327Ea6F
// check nft minted on open sea: https://testnets.opensea.io/assets/sepolia/<contract_address>/<token_id>
// address on sepolia optimism: 0xA2555F09b2aCC3EabD2feee5e2AC36b5Da066e61
const deployContract = async (hre: HardhatRuntimeEnvironment) => {
    const kaiNftTokenContract  = await hre.ethers.getContractFactory("KaiNftToken")
    const kaiNftToken = await kaiNftTokenContract.deploy();
    const kaiNftTokenAddress = await kaiNftToken.getAddress();
    console.log('kaiNftTokenAddress', kaiNftTokenAddress)

}
deployContract(hre).then().catch(err => {
    console.error(err);
    process.exitCode = 1;
})