import { NonceManager } from "@ethersproject/experimental";
import { create } from "domain";
import {BigNumber, Wallet} from "ethers";
import { ethers } from "hardhat";
import { GasPriceManager } from "../../utils/GasPriceManager";
import { AssetContractShared } from "../../typechain-types";
import {expect} from "chai";
import {toASCII} from "punycode";

async function main() {
    const AssetContractFactory = await ethers.getContractFactory("AssetContractShared");
    const provider = ethers.provider;

    const admin = new Wallet(process.env.ADMIN_KEY || "");
    const adminSigner = new NonceManager(new GasPriceManager(provider.getSigner(admin.address)));

    const assetContract = await AssetContractFactory.attach(
        process.env.ASSET_CONTRACT_SHARED_ADDRESS || ""
    );
    const ownerAssetContract = await assetContract.connect(adminSigner);

    const lastNftId = Number(process.env.FINPL_NFT_LAST_TOKEN_ID || "0");
    const quantity = Number(process.env.FINPL_NFT_QUANTITY || "1");
    const data = process.env.FINPL_NFT_DATA || "";

    let makerPart = BigNumber.from(ethers.utils.hexZeroPad(admin.address, 32));
    makerPart = makerPart.shl(96); // shift 12 bytees
    let newIdPart = BigNumber.from(lastNftId + 1);
    newIdPart = newIdPart.shl(40); // shift 5 bytes
    let quantityPart = BigNumber.from(quantity);
    const tokenId = makerPart.add(newIdPart).add(quantityPart);
    console.log("tokenId:", tokenId.toHexString());

    const buffer = ethers.utils.toUtf8Bytes(data);
    await ownerAssetContract.mint(admin.address, tokenId, quantity, buffer);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

