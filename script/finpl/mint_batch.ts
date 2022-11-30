import { NonceManager } from "@ethersproject/experimental";
import {BigNumber, BigNumberish, Wallet} from "ethers";
import { ethers } from "hardhat";
import { GasPriceManager } from "../../utils/GasPriceManager";
import { AssetContractShared } from "../../typechain-types";
import { delay } from "@nomiclabs/hardhat-etherscan/dist/src/etherscan/EtherscanService";
import {string} from "hardhat/internal/core/params/argumentTypes";

async function main() {
    const AssetContractFactory = await ethers.getContractFactory("AssetContractShared");
    const provider = ethers.provider;

    const proxy = new Wallet(process.env.SHARED_PROXY_KEY || "");
    const proxySigner = new NonceManager(new GasPriceManager(provider.getSigner(proxy.address)));
    const creator = process.env.FINPL_NFT_CREATOR || "";

    const assetContract = await AssetContractFactory.attach(
        process.env.ASSET_CONTRACT_SHARED_ADDRESS || ""
    );
    const proxyContract = await assetContract.connect(proxySigner);

    const lastNftId = Number(process.env.FINPL_NFT_LAST_TOKEN_ID || "0");
    const batchCount = Number(process.env.FINPL_NFT_BATCH_COUNT || "1");
    const data = process.env.FINPL_NFT_DATA || "";
    const buffer = ethers.utils.toUtf8Bytes("");

    let tokenIds: BigNumber[] = [];
    let quantities: BigNumberish[] = [];
    let makerPart = BigNumber.from(ethers.utils.hexZeroPad(creator, 32));
    makerPart = makerPart.shl(96); // shift 12 bytees
    let tokenIdsStr: string = "";
    for (let i = 0; i < batchCount; i++) {
        let newIdPart = BigNumber.from(lastNftId + 1 + i);
        newIdPart = newIdPart.shl(40); // shift 5 bytes
        const quantity = Number(process.env.FINPL_NFT_QUANTITY || "1");
        quantities.push(quantity);
        let quantityPart = BigNumber.from(quantity);
        const tokenId = makerPart.add(newIdPart).add(quantityPart);
        tokenIdsStr += tokenId.toHexString() + " , ";
        tokenIds.push(tokenId);
    }
    console.log("====== Combine tokenIds(HEX) ======")
    console.log(tokenIdsStr.slice(0, -3));
    console.log("====== Combine tokenIds ======");
    for (let id of tokenIds) {
        console.log(id.toString());
    }

    await proxyContract.batchMint(creator, tokenIds, quantities, buffer);
    console.log("All tokens minted to:", creator);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
