import { NonceManager } from "@ethersproject/experimental";
import { expect } from "chai";
import { BigNumber, BigNumberish, Wallet } from "ethers";
import { recoverAddress } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { getBasicOrderExecutions, getBasicOrderParameters, getItemETH, toBN, toKey } from "../../test/utils/encoding";
import { ConduitController, Consideration, Seaport, SharedStorefrontLazyMintAdapter } from "../../typechain-types";
import { GasPriceManager } from "../../utils/GasPriceManager";
import {
    checkExpectedEvents,
    createOrder,
    setChainId,
    setContracts,
    setSeaport,
    withBalanceChecks,
} from "../../utils/CommonFunctions";
import type { ConsiderationItem, OfferItem } from "../../test/utils/types";
const { parseEther, keccak256 } = ethers.utils;

const ZeroAddress = "0x0000000000000000000000000000000000000000";

async function main() {
    const SeaportFactory = await ethers.getContractFactory("Seaport");
    const StorefrontFactory = await ethers.getContractFactory("SharedStorefrontLazyMintAdapter");
    const ConduitControlFactory = await ethers.getContractFactory("ConduitController");
    const AssetContractFactory = await ethers.getContractFactory("AssetContractShared");
    const WBOAFactory = await ethers.getContractFactory("WBOA9");
    const provider = ethers.provider;

    const admin = new Wallet(process.env.ADMIN_KEY || "");
    const adminSigner = new NonceManager(new GasPriceManager(provider.getSigner(admin.address)));
    const nftBuyer = new Wallet(process.env.ORDER_NFT_BUYER_KEY || "");
    const nftBuyerSigner = new NonceManager(new GasPriceManager(provider.getSigner(nftBuyer.address)));
    const nftSeller = new Wallet(process.env.ORDER_NFT_SELLER_KEY || "");
    const nftSellerSigner = new NonceManager(new GasPriceManager(provider.getSigner(nftSeller.address)));
    const conduitKey = process.env.CONDUIT_KEY || "";
    const marketplace = await SeaportFactory.attach(process.env.SEAPORT_ADDRESS || "");
    const storefront = await StorefrontFactory.attach(process.env.LAZY_MINT_ADAPTER_ADDRESS || "");
    const conduitController = await ConduitControlFactory.attach(process.env.CONDUIT_CONTROLLER_ADDRESS);
    const assetToken = await AssetContractFactory.attach(process.env.ASSET_CONTRACT_SHARED_ADDRESS);
    const wboaToken = await WBOAFactory.attach(process.env.WBOA_ADDRESS);
    const tokenId = BigNumber.from(process.env.FINPL_NFT_LAST_COMBINE_TOKEN_ID || "");

    setSeaport(marketplace);

    const { conduit: conduitAddress, exists } = await conduitController.getConduit(conduitKey);
    console.log("conduit address: %s for the conduit key: %s", conduitAddress, conduitKey);

    // set the shared proxy of assetToken to SharedStorefront
    await assetToken.connect(adminSigner).addSharedProxyAddress(storefront.address);

    // approve WBOAs of buyer to the Conduit
    let selerAmountTotal = await provider.getBalance(nftBuyer.address);
    await wboaToken.connect(nftBuyerSigner).approve(conduitAddress, selerAmountTotal);

    // update channel for marketplace to conduit
    let status = await conduitController.connect(adminSigner).getChannelStatus(conduitAddress, marketplace.address);
    if (!status) {
        console.log("updateChannel:", conduitAddress, marketplace.address);
        await conduitController.connect(adminSigner).updateChannel(conduitAddress, marketplace.address, true);
    }

    const nftAmount = await assetToken.balanceOf(nftSeller.address, tokenId);
    console.log("NFT balance of the seller", nftSeller.address, ":", nftAmount.toString());

    // The needed amount of WBOA for trading
    const tokenPriceAmount = ethers.utils.parseEther("0.1");
    const spareAmount = ethers.utils.parseEther("1.0");

    // Current status of seller, buyer, and nft
    let amount = await provider.getBalance(nftBuyer.address);
    console.log("NFT buyer(%s) balance:", nftBuyer.address, amount.toString());
    amount = await provider.getBalance(nftSeller.address);
    console.log("NFT seller(%s) balance:", nftSeller.address, amount.toString());
    console.log("====== Minted NFT information ======");
    console.log("tokenId:", tokenId.toHexString());
    console.log("creator:", await assetToken.creator(tokenId));
    console.log("NFT balance of seller:", await assetToken.balanceOf(nftSeller.address, tokenId));

    // deposit BOA to WBOA contract from NFT buyer
    amount = await wboaToken.getBalance(nftBuyer.address);
    if (amount <= tokenPriceAmount.add(spareAmount)) {
        await wboaToken.connect(nftBuyerSigner).deposit({ value: tokenPriceAmount.add(spareAmount) });
    }

    // deposit BOA to WBOA contract from NFT seller
    amount = await wboaToken.getBalance(nftSeller.address);
    if (amount <= spareAmount) {
        await wboaToken.connect(nftSellerSigner).deposit({ value: spareAmount });
    }

    amount = await wboaToken.getBalance(nftBuyer.address);
    console.log("buyer's WBOA:", amount.toString());
    amount = await wboaToken.getBalance(nftSeller.address);
    console.log("seller's WBOA:", amount.toString());

    // TODO: Make utility functions creating offer and consideration

    // Creating an offer which is the ERC20 tokens
    const offerItemType: number = 1;
    const offerToken: string = wboaToken.address;
    const offerIdentifierOrCriteria: BigNumberish = 0;
    const offerStartAmount: BigNumberish = tokenPriceAmount;
    const offerEndAmount: BigNumberish = tokenPriceAmount;
    const offer: OfferItem[] = [
        {
            itemType: offerItemType,
            token: offerToken,
            identifierOrCriteria: toBN(offerIdentifierOrCriteria),
            startAmount: toBN(offerStartAmount),
            endAmount: toBN(offerEndAmount),
        },
    ];

    // Creating the first consideration which is goes to the NFT buyer
    // TODO: Add consideration going to the Proxy
    const itemType: number = 3;
    const token: string = storefront.address;
    const identifierOrCriteria: BigNumberish = tokenId;
    const startAmount: BigNumberish = BigNumber.from(1);
    const endAmount: BigNumberish = BigNumber.from(1);
    const consideration: ConsiderationItem[] = [
        {
            itemType,
            token,
            identifierOrCriteria: toBN(identifierOrCriteria),
            startAmount: toBN(startAmount),
            endAmount: toBN(endAmount),
            recipient: nftBuyer.address,
        },
    ];

    const { order, orderHash, value } = await createOrder(
        nftBuyer,
        ZeroAddress,
        offer,
        consideration,
        1, // PARTIAL_OPEN
        [],
        null,
        nftBuyer,
        ethers.constants.HashZero,
        conduitKey
    );

    console.log("order:", order);
    console.log("offer:", order.parameters.offer);
    console.log("consideration:", order.parameters.consideration);

    const tx = marketplace.connect(nftSellerSigner).fulfillOrder(order, toKey(0), {
        value,
    });

    const receipt = await (await tx).wait();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
