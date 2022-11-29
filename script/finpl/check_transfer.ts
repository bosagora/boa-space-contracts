import { BigNumber, Wallet } from "ethers";
import { ethers } from "hardhat";

async function main() {
    const AssetContractFactory = await ethers.getContractFactory("AssetContractShared");

    const provider = ethers.provider;
    const buyer = new Wallet(process.env.BUYER_KEY || "");
    const creator = new Wallet(process.env.FINPL_NFT_NEW_CREATOR || "");

    const assetContract = await AssetContractFactory.attach(
        process.env.ASSET_CONTRACT_SHARED_ADDRESS || ""
    );

    const tokenIds = process.env.TRANSFER_COMBINE_TOKEN_IDS.split(",");
    console.log("Creator:", creator.address);
    console.log("Buyer:", buyer.address);
    for (let id of tokenIds) {
        const tokenId = BigNumber.from(id.trim());
        console.log("Balances of Token:", tokenId.toHexString());
        console.log("creator: %i, buyer: %i",
            Number(await assetContract.balanceOf(creator.address, tokenId)),
            Number(await assetContract.balanceOf(buyer.address, tokenId)));
    }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});