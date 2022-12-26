/*******************************************************************************

    Script for fulfilling an order with a default conduit key, which offers
    WBOA tokens and sets ERC1155(AssetContractShared) tokens as consideration.
    And this is for lazy minting which means the fulfiller has not minted
    the ERC1155 tokens yet.

*******************************************************************************/

import { NonceManager } from "@ethersproject/experimental";
import { BigNumber, BigNumberish, Wallet } from "ethers";
import { ethers } from "hardhat";
import { toBN, toKey } from "../../test/utils/encoding";
import { ConduitController, Seaport, SharedStorefrontLazyMintAdapter } from "../../typechain-types";
import { GasPriceManager } from "../../utils/GasPriceManager";
import { createOrder, setChainId, setSeaport } from "../../utils/CommonFunctions";
import type { ConsiderationItem, OfferItem } from "../../test/utils/types";
import { createTokenId } from "../../utils/ParseTokenID";

const ZeroAddress = "0x0000000000000000000000000000000000000000";

async function main() {
    const provider = ethers.provider;

    const SeaportFactory = await ethers.getContractFactory("Seaport");
    const StorefrontFactory = await ethers.getContractFactory("SharedStorefrontLazyMintAdapter");
    const ConduitControlFactory = await ethers.getContractFactory("ConduitController");
    const AssetContractFactory = await ethers.getContractFactory("AssetContractShared");
    const WBOAFactory = await ethers.getContractFactory("WBOA9");

    const marketplace = await SeaportFactory.attach(process.env.SEAPORT_ADDRESS || "");
    const storefront = await StorefrontFactory.attach(process.env.LAZY_MINT_ADAPTER_ADDRESS || "");
    const conduitController = await ConduitControlFactory.attach(process.env.CONDUIT_CONTROLLER_ADDRESS);
    const assetToken = await AssetContractFactory.attach(process.env.ASSET_CONTRACT_SHARED_ADDRESS);
    const wboaToken = await WBOAFactory.attach(process.env.WBOA_ADDRESS);

    const admin = new Wallet(process.env.ADMIN_KEY || "");
    const adminSigner = new NonceManager(new GasPriceManager(provider.getSigner(admin.address)));
    const offerer = new Wallet(process.env.ORDER_OFFERER_KEY || "");
    const offererSigner = new NonceManager(new GasPriceManager(provider.getSigner(offerer.address)));
    const fulfiller = new Wallet(process.env.ORDER_FULFILLER_KEY || "");
    const fulfillerSigner = new NonceManager(new GasPriceManager(provider.getSigner(fulfiller.address)));
    const conduitAddress = process.env.CONDUIT_ADDRESS;
    const conduitKey = process.env.CONDUIT_KEY || "";

    const quantity = Number(process.env.FINPL_NFT_QUANTITY || "1");
    const tokenIndex = BigNumber.from(process.env.FINPL_NFT_INDEX || "0");
    const data = process.env.FINPL_NFT_DATA || "";
    const newTokenId = createTokenId(fulfiller.address, tokenIndex, quantity);

    console.log("new token id:", newTokenId);
    setChainId(2019);
    setSeaport(marketplace);

    const { conduit: conduitAddr, exists } = await conduitController.getConduit(conduitKey);
    console.log("conduitKey: %s, conduitAddress: %s", conduitKey, conduitAddr);

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

    // The needed amount of WBOA for trading
    const sellerAmount = ethers.utils.parseEther("0.1");
    const reserveAmount = ethers.utils.parseEther("1.0");

    // Current status of seller, buyer, and nft
    let amount = await provider.getBalance(offerer.address);
    console.log("offerer(%s) balance:", offerer.address, amount.toString());
    amount = await provider.getBalance(fulfiller.address);
    console.log("fulfiller(%s) balance:", fulfiller.address, amount.toString());
    console.log("====== Minted NFT information ======");
    console.log("tokenId:", newTokenId.toHexString());
    console.log("creator:", await assetToken.creator(newTokenId));
    console.log("balance of buyer:", await assetToken.balanceOf(fulfiller.address, newTokenId));

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
    console.log("offerer WBOA:", amount.toString());
    amount = await wboaToken.getBalance(fulfiller.address);
    console.log("fulfiller WBOA:", amount.toString());

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
    const itemType: number = 3;
    const token: string = storefront.address;
    const identifierOrCriteria: BigNumberish = newTokenId;
    const startAmount: BigNumberish = BigNumber.from(10);
    const endAmount: BigNumberish = BigNumber.from(10);
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
