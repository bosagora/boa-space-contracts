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

    const tokenIds = process.env.TRANSFER_COMBINE_TOKEN_IDS.split(",");
    console.log("Creator:", creator);
    console.log("Buyer:", buyer);
    console.log("TokenIds:", tokenIds);
    for (let id of tokenIds) {
        const tokenId = BigNumber.from(id.trim());
        console.log("Balances of Token: %s (%s)", tokenId.toString(), tokenId.toHexString());
        console.log("creator: %i, buyer: %i",
            Number(await assetContract.balanceOf(creator, tokenId)),
            Number(await assetContract.balanceOf(buyer, tokenId)));
    }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
