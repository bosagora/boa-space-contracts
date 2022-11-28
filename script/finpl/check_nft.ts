import { NonceManager } from "@ethersproject/experimental";
import { create } from "domain";
import {BigNumber, Wallet} from "ethers";
import { ethers } from "hardhat";
import { GasPriceManager } from "../../utils/GasPriceManager";
import { ConduitControllerInterface } from "../../typechain-types";
import {expect} from "chai";

async function main() {
    const AssetContractFactory = await ethers.getContractFactory("AssetContractShared");

    const provider = ethers.provider;
    const admin = new Wallet(process.env.ADMIN_KEY || "");
    const adminSigner = new NonceManager(new GasPriceManager(provider.getSigner(admin.address)));
    const curCreator = new Wallet(process.env.FINPL_NFT_NEW_CREATOR || "");

    const assetContract = await AssetContractFactory.attach(
        process.env.ASSET_CONTRACT_SHARED_ADDRESS || ""
    );

    const tokenId = BigNumber.from(process.env.FINPL_NFT_LAST_COMBINE_TOKEN_ID || "");
    const ownerAssetContract = await assetContract.connect(adminSigner);

    console.log("====== Minted NFT information ======");
    console.log("tokenId:", tokenId);
    console.log("tokenId(HEX):", tokenId.toHexString());
    console.log("uri:", await ownerAssetContract.uri(tokenId));
    console.log("creator:", await ownerAssetContract.creator(tokenId));
    console.log("balance of owner:", await ownerAssetContract.balanceOf(admin.address, tokenId));
    console.log("balance of creator:", await ownerAssetContract.balanceOf(curCreator.address, tokenId));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
