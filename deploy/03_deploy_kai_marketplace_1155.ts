import { HardhatRuntimeEnvironment } from "hardhat/types";
import hre from 'hardhat'
const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS || ''
const TREASURY_ADDRESS = process.env.TREASURY_ADDRESS || ''
const FEE_PERCENT = process.env.FEE_PERCENT || '200'
/**
 * 
 * @param hre 
 */
// npx hardhat verify --network sepolia ------
// npx hardhat verify --network optimismSepolia 0x3B118727695F353200B370E8e06001cCCc76D394 "0xA519c8Eb34EcF230894C23958e4e8BA2aa45D690" "0x9764044233633B24965C8f3a6Cac94d04FEfe81E" "200"
const deployContract = async (hre: HardhatRuntimeEnvironment) => {
    if (!TOKEN_ADDRESS || !TREASURY_ADDRESS) {
        throw new Error('TOKEN_ADDRESS or TREASURY_ADDRESS is not set')
    }
    
    const kaiMarketplaceContract  = await hre.ethers.getContractFactory("KaiMarketplace1155")
    const kaiMarketplace = await kaiMarketplaceContract.deploy(TOKEN_ADDRESS, TREASURY_ADDRESS, Number(FEE_PERCENT));
    const kaiMarketplaceAddress = await kaiMarketplace.getAddress();
    console.log('kaiMarketplaceAddress', kaiMarketplaceAddress)

}
deployContract(hre).then().catch(err => {
    console.error(err);
    process.exitCode = 1;
})