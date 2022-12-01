import { NonceManager } from "@ethersproject/experimental";
import { Wallet } from "ethers";
import { ethers } from "hardhat";
import { GasPriceManager } from "../utils/GasPriceManager";

async function main() {
    const LazymintAdapterFactory = await ethers.getContractFactory("SharedStorefrontLazyMintAdapter");
    const provider = ethers.provider;

    const admin = new Wallet(process.env.ADMIN_KEY || "");
    const adminSigner = new NonceManager(new GasPriceManager(provider.getSigner(admin.address)));

    const tokenAddress = process.env.ASSET_CONTRACT_SHARED_ADDRESS || "";
    const lazymintAdapter = await LazymintAdapterFactory.connect(adminSigner).deploy(
        tokenAddress
    );
    await lazymintAdapter.deployed();

    console.log("SharedStorefrontLazyMintAdapter - deployed to:", lazymintAdapter.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
