import { NonceManager } from "@ethersproject/experimental";
import { expect } from "chai";
import { BigNumber, BigNumberish, constants, Contract, ContractReceipt, ContractTransaction, Wallet } from "ethers";
import { recoverAddress } from "ethers/lib/utils";
import { ethers } from "hardhat";
import {
  BoaTestERC1155,
  ConduitInterface,
  ConsiderationInterface,
  EIP1271Wallet__factory, Seaport, TestERC1155,
  TestERC20, TestERC721,
  TestZone
} from "../../typechain-types";
import { GasPriceManager } from "../../utils/GasPriceManager";
const { orderType } = require("../../eip-712-types/order");

const { parseEther, keccak256 } = ethers.utils;
const provider = ethers.provider;

async function main() {
  const AssetContractFactory = await ethers.getContractFactory("AssetContractShared");
  const WBOAFactory = await ethers.getContractFactory("WBOA9");

  const seller = new Wallet(process.env.ORDER_SELLER_KEY || "");
  const buyer = new Wallet(process.env.ORDER_BUYER_KEY || "");
  const assetToken = await AssetContractFactory.attach(process.env.ASSET_CONTRACT_SHARED_ADDRESS || "");
  const wboaToken = await WBOAFactory.attach(process.env.WBOA_ADDRESS);
  const tokenId = BigNumber.from(process.env.FINPL_NFT_LAST_COMBINE_TOKEN_ID || "");

  console.log("====== Seller balance\t:", seller.address);
  console.log("BOA\t:",
      (await provider.getBalance(seller.address)).toString());
  console.log("WBOA\t:",
      (await wboaToken.getBalance(seller.address)).toString());
  console.log("NFT(%s)\t: %i",
      assetToken.address, (await assetToken.balanceOf(seller.address, tokenId)).toString());
  console.log("====== Buyer balance\t:", buyer.address);
  console.log("BOA\t:",
      (await provider.getBalance(buyer.address)).toString());
  console.log("WBOA\t:",
      (await wboaToken.getBalance(buyer.address)).toString());
  console.log("NFT(%s)\t: %i",
      assetToken.address, (await assetToken.balanceOf(buyer.address, tokenId)).toString());
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
