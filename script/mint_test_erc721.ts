import { NonceManager } from "@ethersproject/experimental";
import { BigNumber, Wallet } from "ethers";
import { ethers } from "hardhat";
import { randomBN, toBN } from "../test/utils/encoding";
import { GasPriceManager } from "../utils/GasPriceManager";

async function main() {
    const TestERC721Factory = await ethers.getContractFactory("TestERC721");

    const provider = ethers.provider;
    const creator = new Wallet(process.env.FINPL_NFT_CREATOR_KEY || "");
    const creatorSigner = new NonceManager(new GasPriceManager(provider.getSigner(creator.address)));
    const tokenId = BigNumber.from(process.env.TEST_ERC721_TOKEN_ID || "0");
    const assetContract = await TestERC721Factory.attach(process.env.TEST_ERC721_ADDRESS || "");

    // mint first NFT token of TestERC721
    await assetContract.mint(creator.address, tokenId);
    console.log("Token minted - token id:", tokenId, " to:", creator.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
