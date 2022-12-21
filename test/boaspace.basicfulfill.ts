import { expect } from "chai";
import { ethers, network, waffle } from "hardhat";
import { faucet } from "./utils/faucet";
import type {
    AssetContractShared,
    AssetContractShared__factory as AssetContractSharedFactory,
    ConduitController,
    ConduitController__factory as ConduitControllerFactory,
    Conduit,
    Seaport,
    Seaport__factory as SeaportFactory,
    SharedStorefrontLazyMintAdapter,
    SharedStorefrontLazyMintAdapter__factory as SharedStorefrontLazyMintAdapterFactory,
} from "../typechain-types";
import { createOrder, setChainId, setSeaport } from "../utils/CommonFunctions";
import { createTokenId } from "../utils/ParseTokenID";
import { BigNumber, BigNumberish } from "ethers";
import { getItemETH, toBN, toKey } from "./utils/encoding";
import type { OfferItem } from "./utils/types";
const { parseEther } = ethers.utils;

const ZeroAddress = "0x0000000000000000000000000000000000000000";

/**
 * Accept offer for a single or ERC1155 in exchange for BOA
 */
describe(`Fulfilling a basic order offering NFT and getting BOA(BOASPACE)`, function () {
    const { provider } = waffle;

    setChainId(31337);

    const [admin, offerer, fulfiller] = provider.getWallets();
    const adminSigner = provider.getSigner(admin.address);
    const fulfillerSigner = provider.getSigner(fulfiller.address);

    let assetToken: AssetContractShared;
    let conduitController: ConduitController;
    let marketplace: Seaport;
    let lazymintAdapter: SharedStorefrontLazyMintAdapter;
    let tokenId: BigNumber;
    let tokenQuantity: number;

    before(async () => {
        await faucet(admin.address, provider);
        await faucet(offerer.address, provider);
        await faucet(fulfiller.address, provider);

        console.log("admin: ", admin.address);
        console.log("offerer: ", offerer.address);
        console.log("fulfiller: ", fulfiller.address);

        console.log("admin balance: ", await provider.getBalance(admin.address));
        console.log("offerer balance: ", await provider.getBalance(offerer.address));
        console.log("fulfiller balance: ", await provider.getBalance(fulfiller.address));

        // Deploy AssetContractShared contract
        const name = "BOASPACE Collections";
        const symbol = "BOASPACESTORE";
        const templateURI = "";

        const assetTokenFactory = await ethers.getContractFactory("AssetContractShared");
        assetToken = (await assetTokenFactory
            .connect(admin)
            .deploy(
                name,
                symbol,
                ethers.constants.AddressZero,
                templateURI,
                ethers.constants.AddressZero
            )) as AssetContractShared;
        await assetToken.deployed();
        console.log("AssetContractShared:", assetToken.address);

        // Deploy ConduitController contract
        const conduitControllerFactory = await ethers.getContractFactory("ConduitController");
        conduitController = await conduitControllerFactory.connect(admin).deploy();
        await conduitController.deployed();
        console.log("ConduitController:", conduitController.address);

        // Create a conduit with ConduitController
        const conduitKeyOne = `${admin.address}000000000000000000000000`;
        await conduitController.createConduit(conduitKeyOne, admin.address);
        const { conduit: conduitAddress, exists } = await conduitController.getConduit(conduitKeyOne);
        console.log("ConduitAddress:", conduitAddress, "exists: ", exists);

        // Deploy Seaport contract
        const SeaportFactory = await ethers.getContractFactory("Seaport");
        marketplace = await SeaportFactory.connect(admin).deploy(conduitController.address);
        await marketplace.deployed();
        console.log("Marketplace:", marketplace.address);

        // Deploy SharedStorefrontLazyMintAdapter
        const lazymintAdapterFactory = await ethers.getContractFactory("SharedStorefrontLazyMintAdapter");
        lazymintAdapter = await lazymintAdapterFactory.connect(admin).deploy(assetToken.address);
        await lazymintAdapter.deployed();
        console.log("SharedStorefrontLazyMintAdapter:", lazymintAdapter.address);

        setSeaport(marketplace);

        // approve to the marketpalce
        await assetToken.connect(adminSigner).setApprovalForAll(marketplace.address, true);
        await assetToken.connect(adminSigner).addSharedProxyAddress(marketplace.address);
        console.log("SetApprovalForAll called");
    });

    it("Mint a AssetContractShared token", async () => {
        const creatorContract = await assetToken.connect(offerer);
        tokenQuantity = Number(process.env.FINPL_NFT_QUANTITY || "1");
        const tokenIndex = BigNumber.from(process.env.FINPL_NFT_INDEX || "0");
        const data = process.env.FINPL_NFT_DATA || "";
        const buffer = ethers.utils.toUtf8Bytes(data);

        tokenId = createTokenId(offerer.address, tokenIndex, tokenQuantity);
        console.log("Combined tokenId: %s (%s)", tokenId.toString(), tokenId.toHexString());
        await creatorContract.mint(offerer.address, tokenId, tokenQuantity, buffer);
        console.log("Token minted to:", offerer.address);
    });

    it("Transfer a AssetContractShared token", async () => {
        // Minted Information
        console.log("token id:", tokenId);
        console.log("uri:", await assetToken.uri(tokenId));
        console.log("creator:", await assetToken.creator(tokenId));
        console.log("balance of creator:", (await assetToken.balanceOf(offerer.address, tokenId)).toString());

        const itemType: number = 3;
        const token: string = assetToken.address;
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
        console.log("receipt after fulfillOrder transaction:\n", receipt);

        await network.provider.send("evm_increaseTime", [3600]);
        await network.provider.send("evm_mine");

        expect(await assetToken.balanceOf(offerer.address, tokenId)).equal(tokenQuantity - 1);
        expect(await assetToken.balanceOf(fulfiller.address, tokenId)).equal(1);
    });
});
