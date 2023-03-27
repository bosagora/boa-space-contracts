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

    // deploy TestERC721 contract
    const token = await TestERC721Factory.connect(creatorSigner).deploy();
    await token.deployed();
    console.log("TestERC721 deployed - to:", token.address);

    // mint first NFT token of TestERC721
    await token.mint(creator.address, tokenId);
    console.log("Token minted - token id:", tokenId);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
