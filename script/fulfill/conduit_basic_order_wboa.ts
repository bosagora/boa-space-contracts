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
    const offerer = new Wallet(process.env.ORDER_OFFERER_KEY || "");
    const offererSigner = new NonceManager(new GasPriceManager(provider.getSigner(offerer.address)));
    const fulfiller = new Wallet(process.env.ORDER_FULFILLER_KEY || "");
    const fulfillerSigner = new NonceManager(new GasPriceManager(provider.getSigner(fulfiller.address)));
    const conduitAddress = process.env.CONDUIT_ADDRESS;
    const conduitKey = process.env.CONDUIT_KEY || "";
    const marketplace = await SeaportFactory.attach(process.env.SEAPORT_ADDRESS || "");
    const storefront = await StorefrontFactory.attach(process.env.LAZY_MINT_ADAPTER_ADDRESS || "");
    const conduitController = await ConduitControlFactory.attach(process.env.CONDUIT_CONTROLLER_ADDRESS);
    const assetToken = await AssetContractFactory.attach(process.env.ASSET_CONTRACT_SHARED_ADDRESS);
    const wboaToken = await WBOAFactory.attach(process.env.WBOA_ADDRESS);
    const tokenId = BigNumber.from(process.env.FINPL_NFT_LAST_COMBINE_TOKEN_ID || "");

    setChainId(2019);
    setSeaport(marketplace);

    const { conduit: conduitAddr, exists } = await conduitController.getConduit(conduitKey);
    console.log("getConduit:", conduitAddr, "exists: ", exists);
    console.log("conduitAddress:", conduitAddress);

    // set the shared proxy of assetToken to SharedStorefront
    await assetToken.connect(adminSigner).addSharedProxyAddress(storefront.address);

    // approve WBOAs of seller to the Conduit
    let selerAmountTotal = await provider.getBalance(offerer.address);
    await wboaToken.connect(offererSigner).approve(conduitAddress, selerAmountTotal);

    // update channel for marketplace to conduit
    let status = await conduitController.connect(adminSigner).getChannelStatus(conduitAddress, marketplace.address);
    if (!status) {
        console.log("updateChannel:", conduitAddress, marketplace.address);
        await conduitController.connect(adminSigner).updateChannel(conduitAddress, marketplace.address, true);
    }

    const bal = await provider.getBalance(fulfiller.address);
    console.log("Creator balance:", bal);
    const nftAmount = await assetToken.balanceOf(fulfiller.address, tokenId);
    console.log("balance of", fulfiller.address, ":", nftAmount);

    // The needed amount of WBOA for trading
    const sellerAmount = ethers.utils.parseEther("0.1");
    const reserveAmount = ethers.utils.parseEther("1.0");

    // Current status of seller, buyer, and nft
    let amount = await provider.getBalance(offerer.address);
    console.log("offerer(%s) balance:", offerer.address, amount.toString());
    amount = await provider.getBalance(fulfiller.address);
    console.log("fulfiller(%s) balance:", fulfiller.address, amount.toString());
    console.log("====== Minted NFT information ======");
    console.log("tokenId:", tokenId.toHexString());
    console.log("creator:", await assetToken.creator(tokenId));
    console.log("balance of buyer:", await assetToken.balanceOf(fulfiller.address, tokenId));

    // deposit BOA to WBOA contract from seller
    amount = await wboaToken.getBalance(offerer.address);
    if (amount <= sellerAmount.add(reserveAmount)) {
        await wboaToken.connect(offererSigner).deposit({ value: sellerAmount.add(reserveAmount) });
    }
    amount = await wboaToken.getBalance(fulfiller.address);
    if (amount <= reserveAmount) {
        await wboaToken.connect(fulfillerSigner).deposit({ value: reserveAmount });
    }
    amount = await wboaToken.getBalance(offerer.address);
    console.log("seller's WBOA:", amount.toString());
    amount = await wboaToken.getBalance(fulfiller.address);
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
            endAmount: toBN(sellerEndAmount),
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
            recipient: offerer.address,
        },
    ];

    const { order, orderHash, value } = await createOrder(
        offerer,
        ZeroAddress,
        offer,
        consideration,
        1, // PARTIAL_OPEN
        [],
        null,
        offerer,
        ethers.constants.HashZero,
        conduitKey
    );

    console.log("order:", order);
    console.log("offer:", order.parameters.offer);
    console.log("consideration:", order.parameters.consideration);

    const tx = marketplace.connect(fulfillerSigner).fulfillOrder(order, toKey(0), {
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
