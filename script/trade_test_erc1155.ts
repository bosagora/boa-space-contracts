import { NonceManager } from "@ethersproject/experimental";
import { expect } from "chai";
import { BigNumber, BigNumberish, Wallet } from "ethers";
import { recoverAddress } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { getItemETH, toBN, toKey } from "../test/utils/encoding";
import { BoaTestERC1155, Seaport, TestZone } from "../typechain-types";
import { GasPriceManager } from "../utils/GasPriceManager";
import { checkExpectedEvents, createOrder, setContracts, withBalanceChecks } from "../utils/CommonFunctions";
import type { OfferItem } from "../test/utils/types";
const { parseEther, keccak256 } = ethers.utils;

async function main() {
    const SeaportFactory = await ethers.getContractFactory("Seaport");
    const TestERC1155Factory = await ethers.getContractFactory("BoaTestERC1155");
    const provider = ethers.provider;

    const creator = new Wallet(process.env.USER_KEY || "");
    const owner = new Wallet(process.env.OWNER_KEY || "");
    const zone = new Wallet(process.env.ZONE_KEY || "");
    const buyer = new Wallet(process.env.BUYER_KEY || "");
    const creatorSigner = new NonceManager(new GasPriceManager(provider.getSigner(creator.address)));
    const buyerSigner = new NonceManager(new GasPriceManager(provider.getSigner(buyer.address)));
    const marketplaceContract = await SeaportFactory.attach(process.env.SEAPORT_ADDRESS || "");
    const testERC1155 = await TestERC1155Factory.attach(process.env.BOA_TEST_ERC1155_ADDRESS || "");
    setContracts(marketplaceContract, testERC1155);

    const amount = await provider.getBalance(creator.address);
    console.log("Creator balance:", amount);
    const nftAmount = await testERC1155.getAmount(creator.address, 0);
    console.log("balance of", creator.address, ":", nftAmount);

    const itemType: number = 3;
    const token: string = testERC1155.address;
    const identifierOrCriteria: BigNumberish = 0;
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

    const consideration = [
        getItemETH(parseEther("1"), parseEther("10"), creator.address),
        getItemETH(parseEther("1"), parseEther("10"), zone.address),
        getItemETH(parseEther("1"), parseEther("10"), owner.address),
    ];

    const { order, orderHash, value } = await createOrder(
        creator,
        zone,
        offer,
        consideration,
        0 // FULL_OPEN
    );

    console.log("offer:", order.parameters.offer);
    console.log("order:", order);
    console.log("orderHash:", orderHash);
    console.log("value:", value);

    await withBalanceChecks([order], 0, undefined, async () => {
        const tx = marketplaceContract.connect(buyerSigner).fulfillOrder(order, toKey(0), {
            value,
        });
        const receipt = await (await tx).wait();
        console.log("receipt after fulfullOrder transaction:\n", receipt);
        await checkExpectedEvents(tx, receipt, [
            {
                order,
                orderHash,
                fulfiller: buyer.address,
                fulfillerConduitKey: toKey(0),
            },
        ]);

        return receipt;
    });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
