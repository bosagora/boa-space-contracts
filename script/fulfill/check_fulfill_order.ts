import { NonceManager } from "@ethersproject/experimental";
import { expect } from "chai";
import { BigNumber, BigNumberish, constants, Contract, ContractReceipt, ContractTransaction, Wallet } from "ethers";
import { recoverAddress } from "ethers/lib/utils";
import { ethers } from "hardhat";
import {
    BoaTestERC1155,
    ConduitInterface,
    ConsiderationInterface,
    EIP1271Wallet__factory,
    Seaport,
    TestERC1155,
    TestERC20,
    TestERC721,
    TestZone,
} from "../../typechain-types";
import { GasPriceManager } from "../../utils/GasPriceManager";
const { orderType } = require("../../eip-712-types/order");

const { parseEther, keccak256 } = ethers.utils;
const provider = ethers.provider;

async function main() {
    const AssetContractFactory = await ethers.getContractFactory("AssetContractShared");
    const WBOAFactory = await ethers.getContractFactory("WETH");

    const proxyAddress = process.env.PAYABLE_PROXY_ADDRESS;
    const feeWithdrawAddress = process.env.FEE_WITHDRAW_ADDRESS;
    const creator = new Wallet(process.env.FINPL_NFT_CREATOR_KEY || "");
    const nftBuyer = new Wallet(process.env.ORDER_NFT_BUYER_KEY || "");
    const nftSeller = new Wallet(process.env.ORDER_NFT_SELLER_KEY || "");
    const assetToken = await AssetContractFactory.attach(process.env.ASSET_CONTRACT_SHARED_ADDRESS || "");
    const wboaToken = await WBOAFactory.attach(process.env.WBOA_ADDRESS);
    const tokenId = BigNumber.from(process.env.FINPL_NFT_LAST_COMBINE_TOKEN_ID || "");

    console.log("====== Asset Token");
    console.log("contract address:", assetToken.address);
    console.log("token ID\t:", tokenId.toString());
    console.log("NFT creator\t:", creator.address);
    console.log("====== NFT seller");
    console.log("address\t:", nftSeller.address);
    console.log("BOA\t:", (await provider.getBalance(nftSeller.address)).toString());
    console.log("WBOA\t:", (await wboaToken.balanceOf(nftSeller.address)).toString());
    console.log("NFT amount :", (await assetToken.balanceOf(nftSeller.address, tokenId)).toString());
    console.log("====== NFT buyer");
    console.log("address\t:", nftBuyer.address);
    console.log("BOA\t:", (await provider.getBalance(nftBuyer.address)).toString());
    console.log("WBOA\t:", (await wboaToken.balanceOf(nftBuyer.address)).toString());
    console.log("NFT amount :", (await assetToken.balanceOf(nftBuyer.address, tokenId)).toString());
    console.log("====== PayableProxy Balances (%s)", proxyAddress);
    console.log("BOA\t:", (await provider.getBalance(proxyAddress)).toString());
    console.log("WBOA\t:", (await wboaToken.balanceOf(proxyAddress)).toString());
    console.log("====== Fee Withdraw Address Balances (%s)", feeWithdrawAddress);
    console.log("BOA\t:", (await provider.getBalance(feeWithdrawAddress)).toString());
    console.log("WBOA\t:", (await wboaToken.balanceOf(feeWithdrawAddress)).toString());
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
