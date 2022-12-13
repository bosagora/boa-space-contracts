import { NonceManager } from "@ethersproject/experimental";
import { expect } from "chai";
import { BigNumber, BigNumberish, Wallet } from "ethers";
import { recoverAddress } from "ethers/lib/utils";
import { ethers } from "hardhat";
import {getBasicOrderExecutions, getBasicOrderParameters, getItemETH, toBN, toKey} from "../../test/utils/encoding";
import {ConduitController, Consideration, Seaport, SharedStorefrontLazyMintAdapter} from "../../typechain-types";
import { GasPriceManager } from "../../utils/GasPriceManager";
import { checkExpectedEvents, createOrder, setContracts, withBalanceChecks } from "../../utils/CommonFunctions";
import type {ConsiderationItem, OfferItem} from "../../test/utils/types";
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
    const seller = new Wallet(process.env.ORDER_SELLER_KEY || "");
    const sellerSigner = new NonceManager(new GasPriceManager(provider.getSigner(seller.address)));
    const buyer = new Wallet(process.env.ORDER_BUYER_KEY || "");
    const buyerSigner = new NonceManager(new GasPriceManager(provider.getSigner(buyer.address)));
    const conduitAddress = process.env.CONDUIT_ADDRESS;
    const marketplace = await SeaportFactory.attach(process.env.SEAPORT_ADDRESS || "");
    const storefront = await StorefrontFactory.attach(process.env.LAZY_MINT_ADAPTER_ADDRESS || "");
    const conduitController = await ConduitControlFactory.attach(process.env.CONDUIT_CONTROLLER_ADDRESS);
    const assetToken = await AssetContractFactory.attach(process.env.ASSET_CONTRACT_SHARED_ADDRESS);
    const wboaToken = await WBOAFactory.attach(process.env.WBOA_ADDRESS);
    const tokenId = BigNumber.from(process.env.FINPL_NFT_LAST_COMBINE_TOKEN_ID || "");

    setContracts(marketplace, assetToken);

    // set the shared proxy of assetToken to SharedStorefront
    await assetToken.connect(adminSigner).setApprovalForAll(marketplace.address, true);
    await assetToken.connect(adminSigner).addSharedProxyAddress(marketplace.address);

    // The needed amount of WBOA for trading
    const sellerAmount = ethers.utils.parseEther("0.1");
    const reserveAmount = ethers.utils.parseEther("0.1");

    // approve WBOAs of seller to the Seaport
    await wboaToken.connect(sellerSigner).approve(marketplace.address, sellerAmount);

    // update channel for seller and buyer
    let status = await conduitController.getChannelStatus(conduitAddress, seller.address);
    if (!status) {
        await conduitController.updateChannel(conduitAddress, seller.address, true);
    }
    status = await conduitController.getChannelStatus(conduitAddress, buyer.address);
    if (!status) {
        await conduitController.updateChannel(conduitAddress, buyer.address, true);
    }

    // Current status of seller, buyer, and nft
    let amount = await provider.getBalance(seller.address);
    console.log("seller(%s) balance:", seller.address, amount.toString());
    amount = await provider.getBalance(buyer.address);
    console.log("buyer(%s) balance:", buyer.address, amount.toString());
    console.log("====== Minted NFT information ======");
    console.log("tokenId:", tokenId.toHexString());
    console.log("creator:", await assetToken.creator(tokenId));
    console.log("balance of buyer:", await assetToken.balanceOf(buyer.address, tokenId));

    // deposit BOA to WBOA contract from seller
    amount = await wboaToken.getBalance(seller.address);
    if (amount <= sellerAmount.add(reserveAmount)) {
        await wboaToken.connect(sellerSigner).deposit(
            {value: sellerAmount.add(reserveAmount)}
        );
    }
    amount = await wboaToken.getBalance(buyer.address);
    if (amount <= reserveAmount) {
        await wboaToken.connect(buyerSigner).deposit(
            {value: reserveAmount}
        );
    }
    amount = await wboaToken.getBalance(seller.address);
    console.log("seller's WBOA:", amount.toString());
    amount = await wboaToken.getBalance(buyer.address);
    console.log("buyer's WBOA:", amount.toString());

    // TODO: Make utility functions creating offer and consideration

    // Creating an offer which comes from seller
    const sellerItemType: number = 1;
    const sellerToken: string = wboaToken.address;
    const sellerIdentifierOrCriteria: BigNumberish = 0;
    const sellerStartAmount: BigNumberish = sellerAmount;
    const sellerEndAmount: BigNumberish = sellerAmount;
    const offer: OfferItem[] = [
        {
            itemType: sellerItemType,
            token: sellerToken,
            identifierOrCriteria: toBN(sellerIdentifierOrCriteria),
            startAmount: toBN(sellerStartAmount),
            endAmount: toBN(sellerEndAmount)
        },
    ];

    // Creating the first consideration which is goes to the creator
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
            recipient: seller.address
        },
    ];

    const {order, orderHash, value} = await createOrder(
        seller,
        ZeroAddress,
        offer,
        consideration,
        1, // PARTIAL_OPEN
    );

    console.log("order:", order);
    console.log("offer:", order.parameters.offer);
    console.log("consideration:", order.parameters.consideration);
    console.log("orderHash:", orderHash);
    console.log("value:", value);

    const tx = marketplace
        .connect(buyerSigner)
        .fulfillOrder(order, toKey(0), {
            value,
        });
    const receipt = await (await tx).wait();
    console.log("receipt after fulfullOrder transaction:\n", receipt);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
