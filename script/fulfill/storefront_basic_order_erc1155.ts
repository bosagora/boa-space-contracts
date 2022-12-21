import { NonceManager } from "@ethersproject/experimental";
import { expect } from "chai";
import { BigNumber, BigNumberish, Wallet } from "ethers";
import { recoverAddress } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { getBasicOrderExecutions, getBasicOrderParameters, getItemETH, toBN, toKey } from "../../test/utils/encoding";
import { ConduitController, Consideration, Seaport, SharedStorefrontLazyMintAdapter } from "../../typechain-types";
import { GasPriceManager } from "../../utils/GasPriceManager";
import { checkExpectedEvents, createOrder, setContracts, withBalanceChecks } from "../../utils/CommonFunctions";
import type { ConsiderationItem, OfferItem } from "../../test/utils/types";
const { parseEther, keccak256 } = ethers.utils;

const ZeroAddress = "0x0000000000000000000000000000000000000000";

async function main() {
    const SeaportFactory = await ethers.getContractFactory("Seaport");
    const StorefrontFactory = await ethers.getContractFactory("SharedStorefrontLazyMintAdapter");
    const AssetContractFactory = await ethers.getContractFactory("AssetContractShared");
    const provider = ethers.provider;

    const offerer = new Wallet(process.env.ORDER_OFFERER_KEY || "");
    const admin = new Wallet(process.env.ADMIN_KEY || "");
    const adminSigner = new NonceManager(new GasPriceManager(provider.getSigner(admin.address)));
    const fulfiller = new Wallet(process.env.ORDER_FULFILLER_KEY || "");
    const fulfillerSigner = new NonceManager(new GasPriceManager(provider.getSigner(fulfiller.address)));
    const marketplace = await SeaportFactory.attach(process.env.SEAPORT_ADDRESS || "");
    const storefront = await StorefrontFactory.attach(process.env.LAZY_MINT_ADAPTER_ADDRESS || "");
    const assetToken = await AssetContractFactory.attach(process.env.ASSET_CONTRACT_SHARED_ADDRESS);
    const tokenId = BigNumber.from(process.env.FINPL_NFT_LAST_COMBINE_TOKEN_ID || "");

    setContracts(marketplace, assetToken);

    // set the shared proxy of assetToken to SharedStorefront
    await assetToken.connect(adminSigner).setApprovalForAll(marketplace.address, true);
    // await assetToken.connect(adminSigner).addSharedProxyAddress(marketplace.address);

    // TODO: Make utility functions creating offer and consideration

    const itemType: number = 3;
    const token: string = storefront.address;
    const identifierOrCriteria: BigNumberish = tokenId;
    const startAmount: BigNumberish = BigNumber.from(1);
    const endAmount: BigNumberish = BigNumber.from(1);
    const offer: OfferItem[] = [
        {
            itemType,
            token,
            identifierOrCriteria: toBN(identifierOrCriteria),
            startAmount: toBN(startAmount),
            endAmount: toBN(endAmount),
        },
    ];

    const consideration = [getItemETH(parseEther("0.1"), parseEther("0.1"), offerer.address)];

    const { order, orderHash, value } = await createOrder(
        offerer,
        ZeroAddress,
        offer,
        consideration,
        0 // FULL_OPEN
    );

    console.log("order:", order);
    console.log("offer:", order.parameters.offer);
    console.log("consideration:", order.parameters.consideration);
    console.log("orderHash:", orderHash);
    console.log("value:", value);

    const tx = marketplace.connect(fulfillerSigner).fulfillOrder(order, toKey(0), {
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
