import { BigNumber, Wallet } from "ethers";
import { ethers } from "hardhat";

async function main() {
    const AssetContractFactory = await ethers.getContractFactory("AssetContractShared");

    const provider = ethers.provider;
    const buyer = process.env.FINPL_NFT_BUYER || "";
    const creator = process.env.FINPL_NFT_CREATOR || "";

    const assetContract = await AssetContractFactory.attach(
        process.env.ASSET_CONTRACT_SHARED_ADDRESS || ""
    );

    const tokenIds = process.env.MANY_BUYER_COMBINE_TOKEN_IDS.split(",");
    const buyers = process.env.MANY_BUYER_BUYERS.split(",");
    for (let i = 0; i < tokenIds.length; i++) {
        const tokenId = BigNumber.from(tokenIds[i].trim());
        console.log("# Balances of Token: %s (%s)", tokenId.toString(), tokenId.toHexString());
        console.log("\tcreator(%s): %i, buyer(%s): %i",
            creator,
            Number(await assetContract.balanceOf(creator, tokenId)),
            buyers[i].trim(),
            Number(await assetContract.balanceOf(buyers[i].trim(), tokenId)));
    }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
