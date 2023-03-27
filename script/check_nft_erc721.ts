import { NonceManager } from "@ethersproject/experimental";
import { create } from "domain";
import { BigNumber, Wallet } from "ethers";
import { ethers } from "hardhat";
import { GasPriceManager } from "../utils/GasPriceManager";
import { parseTokenId } from "../utils/ParseTokenID";

async function main() {
    const TestERC721Factory = await ethers.getContractFactory("TestERC721");

    const provider = ethers.provider;
    const creator = new Wallet(process.env.FINPL_NFT_CREATOR_KEY || "");

    const assetContract = await TestERC721Factory.attach(process.env.TEST_ERC721_ADDRESS || "");
    const tokenId = BigNumber.from(process.env.TEST_ERC721_TOKEN_ID || "");

    console.log("====== Minted NFT information ======");
    console.log("tokenId:", tokenId);
    console.log("balance of creator:", (await assetContract.balanceOf(creator.address)).toString());
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
