import { NonceManager } from "@ethersproject/experimental";
import { create } from "domain";
import { Wallet } from "ethers";
import { ethers } from "hardhat";
import { GasPriceManager } from "../utils/GasPriceManager";
import { ConduitControllerInterface } from "../typechain-types";
import { expect } from "chai";

async function main() {
    const ConduitCreatorFactory = await ethers.getContractFactory("ConduitCreator");
    const ConduitControllerFactory = await ethers.getContractFactory("ConduitController");

    const provider = ethers.provider;
    const admin = new Wallet(process.env.ADMIN_KEY || "");
    const adminSigner = new NonceManager(new GasPriceManager(provider.getSigner(admin.address)));

    const conduitCreator = await ConduitCreatorFactory.attach(process.env.CONDUIT_CREATOR_ADDRESS || "");
    const conduitContorller = await ConduitControllerFactory.attach(process.env.CONDUIT_CONTROLLER_ADDRESS || "");
    const ownerConduitContorller = await conduitContorller.connect(adminSigner);
    const ownerConduitCreator = await conduitCreator.connect(adminSigner);

    const conduitKeyOne = `${admin.address}000000000000000000000000`;
    await ownerConduitContorller.createConduit(conduitKeyOne, admin.address);

    console.log("Conduit for conduitKey:", conduitKeyOne, "created.");
    console.log("Please chech the Conduit address `get_conduit.ts`.");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
