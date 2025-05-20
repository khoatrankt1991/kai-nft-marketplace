import { HardhatRuntimeEnvironment } from "hardhat/types";
import hre from 'hardhat'
const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS || ''
const NFT_ADDRESS = process.env.NFT_ADDRESS || ''
/**
 * 
 * @param hre 
 */
// npx hardhat verify --network sepolia 0x7AAbA50Cd2e32E23506c162094fD47849fBDC0AF "0x4Fb7619c7BDE8Dd4fd308A6CfC6a794e1327Ea6F" "0x7D98DF6357b07A3c0deDF849fD829f7296b818F5"
const deployContract = async (hre: HardhatRuntimeEnvironment) => {
    if (!TOKEN_ADDRESS || !NFT_ADDRESS) {
        throw new Error('TOKEN_ADDRESS or NFT_ADDRESS is not set')
    }
    const kaiGachaContract  = await hre.ethers.getContractFactory("KaiGacha")
    const kaiGacha = await kaiGachaContract.deploy(NFT_ADDRESS, TOKEN_ADDRESS);
    const kaiGachaAddress = await kaiGacha.getAddress();
    console.log('kaiGachaAddress', kaiGachaAddress)

}
deployContract(hre).then().catch(err => {
    console.error(err);
    process.exitCode = 1;
})