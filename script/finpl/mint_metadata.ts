import { NonceManager } from "@ethersproject/experimental";
import { BigNumber, Wallet } from "ethers";
import { ethers } from "hardhat";
import { GasPriceManager } from "../../utils/GasPriceManager";
import { AssetContractShared } from "../../typechain-types";
import { delay } from "@nomiclabs/hardhat-etherscan/dist/src/etherscan/EtherscanService";
import {parseTokenId} from "../../utils/ParseTokenID";

async function main() {
    const AssetContractFactory = await ethers.getContractFactory("AssetContractShared");
    const provider = ethers.provider;

    const creator = new Wallet(process.env.FINPL_NFT_CREATOR_KEY || "");
    const creatorSigner = new NonceManager(new GasPriceManager(provider.getSigner(creator.address)));

    const assetContract = await AssetContractFactory.attach(
        process.env.ASSET_CONTRACT_SHARED_ADDRESS || ""
    )
    const creatorContract = await assetContract.connect(creatorSigner);

    const lastNftId = process.env.FINPL_NFT_LAST_COMBINE_TOKEN_ID || "0";
    const [address, tokenIndex, maxSupply] = parseTokenId(lastNftId);
    const quantity = Number(process.env.FINPL_NFT_QUANTITY || "1");
    const data = process.env.FINPL_NFT_DATA || "";
    const buffer = ethers.utils.toUtf8Bytes(data);

    let makerPart = BigNumber.from(ethers.utils.hexZeroPad(creator.address, 32));
    makerPart = makerPart.shl(96); // shift 12 bytees
    let newIdPart = BigNumber.from(tokenIndex + 1);
    newIdPart = newIdPart.shl(40); // shift 5 bytes
    let quantityPart = BigNumber.from(quantity);
    const tokenId = makerPart.add(newIdPart).add(quantityPart);
    console.log("Combined tokenId:", tokenId.toString(), "(", tokenId.toHexString(), ")");

    await creatorContract.mint(creator.address, tokenId, quantity, buffer);
    console.log("Token minted to:", creator.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
