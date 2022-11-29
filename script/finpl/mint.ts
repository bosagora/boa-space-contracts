import { NonceManager } from "@ethersproject/experimental";
import { BigNumber, Wallet } from "ethers";
import { ethers } from "hardhat";
import { GasPriceManager } from "../../utils/GasPriceManager";
import { AssetContractShared } from "../../typechain-types";
import { delay } from "@nomiclabs/hardhat-etherscan/dist/src/etherscan/EtherscanService";

async function main() {
    const AssetContractFactory = await ethers.getContractFactory("AssetContractShared");
    const provider = ethers.provider;

    const proxy = new Wallet(process.env.SHARED_PROXY_KEY || "");
    const proxySigner = new NonceManager(new GasPriceManager(provider.getSigner(proxy.address)));
    const newCreator = new Wallet(process.env.FINPL_NFT_CREATOR || "");

    const assetContract = await AssetContractFactory.attach(
        process.env.ASSET_CONTRACT_SHARED_ADDRESS || ""
    )
    const proxyContract = await assetContract.connect(proxySigner);

    const lastNftId = Number(process.env.FINPL_NFT_LAST_TOKEN_ID || "0");
    const quantity = Number(process.env.FINPL_NFT_QUANTITY || "1");
    const data = process.env.FINPL_NFT_DATA || "";
    const buffer = ethers.utils.toUtf8Bytes("");

    let makerPart = BigNumber.from(ethers.utils.hexZeroPad(newCreator.address, 32));
    makerPart = makerPart.shl(96); // shift 12 bytees
    let newIdPart = BigNumber.from(lastNftId + 1);
    newIdPart = newIdPart.shl(40); // shift 5 bytes
    let quantityPart = BigNumber.from(quantity);
    const tokenId = makerPart.add(newIdPart).add(quantityPart);
    console.log("Combined tokenId:", tokenId.toString(), "(", tokenId.toHexString(), ")");

    await proxyContract.mint(newCreator.address, tokenId, quantity, buffer);
    console.log("Token minted to:", newCreator.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
