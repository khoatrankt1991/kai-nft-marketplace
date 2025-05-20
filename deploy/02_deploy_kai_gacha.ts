import { HardhatRuntimeEnvironment } from "hardhat/types";
import hre from 'hardhat'
const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS || ''
const NFT_ADDRESS = process.env.NFT_ADDRESS || ''
/**
 * 
 * @param hre 
 */
// npx hardhat verify --network sepolia 0x7AAbA50Cd2e32E23506c162094fD47849fBDC0AF "0x4Fb7619c7BDE8Dd4fd308A6CfC6a794e1327Ea6F" "0x7D98DF6357b07A3c0deDF849fD829f7296b818F5"
// npx hardhat verify --network optimismSepolia 0xEBb2c02A3eAC5912eA3785e5e4F367a09ff5697A "0xA2555F09b2aCC3EabD2feee5e2AC36b5Da066e61" "0xA519c8Eb34EcF230894C23958e4e8BA2aa45D690"
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