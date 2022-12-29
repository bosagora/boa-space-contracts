# Contents
- [Deployment of contracts](#deployment-of-contracts)
  - [Deploying ConduitController contract](#deploying-conduitcontraoller-contract)
  - [Creating Conduit](#creating-conduit)
  - [Deploying Seaport contract](#deploying-seaport-contract)
  - [Deploying AssetContractShared contract](#deploying-assetcontractshared-contract)
  - [Deploying SharedStorefrontLazymintAdapter contract](#deploying-sharedstorefrontlazymintadapter-contract)
- [Minting an AssetContract NFT](#minting-an-assetcontractshared-nft)
  - [Set information and mint an NFT token](#set-information-and-mint-an-nft-token)
  - [Check the information on the minted NFT token](#check-the-information-on-the-minted-nft-token)
- [Transfer of AssetContractShared Tokens with Seaport](#transfer-of-assetcontractshared-tokens-with-seaport)
  - [Prerequisites](#prerequisites)
  - [Fulfill through the Seaport and SharedStorefrontLazyMintAdapter without Conduit](#fulfill-through-the-seaport-and-sharedstorefrontlazymintadapter-without-conduit)
    - [Offer NFT and receive BOA as consideration](#offer-nft-and-receive-boa-as-consideration)
    - [Offer WBOA and receive NFT as consideration](#offer-wboa-and-receive-nft-as-consideration)
    - [Offer WBOA and receive NFT that is lazily minted as consideration](#offer-wboa-and-receive-nft-that-is-lazily-minted-as-consideration)
  - [Fulfill through the Seaport, Conduit, and SharedStorefrontLazyMintAdapter](#fulfill-through-the-seaport-conduit-and-sharedstorefrontlazymintadapter)
    - [Offer WBOA and receive NFT as consideration](#offer-wboa-and-receive-nft-as-consideration)
    - [Offer WBOA and receive NFT that is lazily minted as consideration](#offer-wboa-and-receive-nft-that-is-lazily-minted-as-consideration-1)
  - [Fulfill only through the Seaport](#fulfill-only-through-the-seaport)

All the description is for the [Bosagora TestNet](https://testnet.boascan.io).

# Deployment of contracts
You should follow the order of deploying the contracts because one contract should be deployed before another contract like the `ConduitController` should be earlier deployed to deploy the `Seaport` by passing the address of the `ConduitController` in the constructor.

## Deploying ConduitContraoller contract
Run this script for deploying the contract.
```
npx hardhat run script/deploy_conduit.ts --network testnet
```
You get the result of deploying the contract.
```
ConduitController - deployed to: 0x4d2335c88eb74ed54CEbA06Bb8DB69c4eab5feaD
```

You should set the deployed address of the `ConduitContraoller` contract into the `CONDUIT_CONTROLLER_ADDRESS` constant in `.env` file.
```
CONDUIT_CONTROLLER_ADDRESS=0xFB15f7cB1E06544A791DbEd6AfdB9C705bF5eF60
```

## Creating Conduit
**We don't use a default conduit on trading NFTs. So we don't need the conduit in fact but we can set the default conduit anyway.**

We use a default conduit in the BosSpace, so we need to create the conduit which should be set to the `SharedStorefrontLazymintAdapter` contract.

Before creating a default conduit, you should check the conduit key in the `.env` file as follows. Our default conduit key is always the same as the following value.
```
CONDUIT_KEY=0xdedF18e2fdf26Ec8f889EfE4ec84D7206bDC431E000000000000000000000000
```

Run this script for creating the default conduit.
```
npx hardhat run script/create_conduit.ts --network testnet
```

And just check the conduit address for the conduit key. 
```
$ npx hardhat run script/get_conduit.ts --network testnet   
Conduit address: 0x65a14fDc9d62fc15454FE3ba1b59ABc59FF58A1b
conduitKey:  0xdedF18e2fdf26Ec8f889EfE4ec84D7206bDC431E000000000000000000000000
```

## Deploying Seaport contract
Run this script for deploying the contract.
```
npx hardhat run script/deploy_seaport.ts --network testnet
```
You get the result of deploying the contract.
```
Seaport - deployed to: 0xB38C5e7ecAe4a2E3B11E69AA98D9C5F087De8C90
```

You should set the deployed address of the `Seaport` contract into the `SEAPORT_ADDRESS` constant in `.env` file.
```
SEAPORT_ADDRESS=0xB38C5e7ecAe4a2E3B11E69AA98D9C5F087De8C90
```

Run this script for adding the channel for the Seaport address to the the default conduit.
```
npx hardhat run script/update_conduit_channel.ts --network testnet
```

## Deploying AssetContractShared contract
Set the `name`, `symbol`, `templateURI` in the `.env` file which are the properties of the contract. The value of `templateURI` is optional.
```
# Parameters of AssetContractShared constructor
ASSET_CONTRACT_NAME="BOASPACE Collections"
ASSET_CONTRACT_SYMBOL=BOASPACESTORE
ASSET_CONTRACT_TEMPLATE_URI=
```
Run this script for deploying the contract.
```
npx hardhat run script/deploy_asset.ts --network testnet
```
You get the result of deploying the contract.
```
AssetContractShared - deployed to: 0x5d41eb6b532660932627E3A9BaE5B94B797F18b5
```

You should set the deployed address of the `AssetContractShared` contract into the `ASSET_CONTRACT_SHARED_ADDRESS` constant in `.env` file.
```
ASSET_CONTRACT_SHARED_ADDRESS=0x5d41eb6b532660932627E3A9BaE5B94B797F18b5
```

You can check the information on the deployed contract as follows.
```
====== AssetContractShared information ======
address: 0x5d41eb6b532660932627E3A9BaE5B94B797F18b5
name: BoaSpace Collections
symbol: BOASTORE
templateURI: 
```

## Deploying SharedStorefrontLazyMintAdapter contract
Before this contract, we should set the following hardcoded state variables in the `SharedStorefrontLazyMintAdapter.sol`.
```solidity
address private constant SEAPORT = 0x4F445109d11419c3612e43D2e71a3593921621E0;
address private constant CONDUIT = 0xCef34f700b0F060fAA00E91001259E80Fcdc9570;
```
- SEAPORT: the address of the `Seaport` contract
- CONDUIT: the address of the `Conduit` contract which is created from [this section](#creating-conduit).

Run this script for deploying the contract.
```
npx hardhat run script/deploy_lazymint_adapter.ts --network testnet
```
You get the result of deploying the contract.
```
SharedStorefrontLazyMintAdapter - deployed to: 0xE11FDE48B267C0d4c56e38E7c7868aE5aE2C59Dd
```

You should set the deployed address of the `SharedStorefrontLazymintAdapter` contract into the `LAZY_MINT_ADAPTER_ADDRESS` constant in `.env` file.
```
LAZY_MINT_ADAPTER_ADDRESS=0xE11FDE48B267C0d4c56e38E7c7868aE5aE2C59Dd
```

# Minting an AssetContractShared NFT
## Setting the shared proxy of AssetContractShared
The deployer that is represented as `ADMIN_KEY` in .env file should get the role of the shared proxy for some scripts like `transfer_batch.ts` and `transfer_buyer.ts`. So you should run this script before transferring `AssetContractShared` NFT tokens. 
```
npx hardhat run script/finpl/add_shared_proxy.ts --network testnet
```

## Set information and mint an NFT token

### Set information for minting

You should mint an NFT token before trading. This is a description of how to mint an NFT token. You could mint FINPL tokens also with these commands.

Set the information of the NFT in `.env` file that you want to mint.
```
FINPL_NFT_INDEX=1
FINPL_NFT_QUANTITY=100
FINPL_NFT_DATA=https://ipfs.io/ipfs/QmXdYWxw3di8Uys9fmWTmdariUoUgBCsdVfHtseL2dtEP7
FINPL_NFT_CREATOR_KEY=bacfa3fbe768c1665feee09af7182ae53ca9a334db747b3751149f81e448ac26
```

### Mint new NFT tokens
Run this script to mint an NFT.
```
npx hardhat run script/finpl/mint.ts --network testnet'
```

And you get the result of the minting.
```
Combined tokenId: 78124813713363012903054561010911293954183699126175542122344455273147682259044 ( 0xacb913db781a46611faa04ff6cb9a370df069eed0000000000005e0000000064 )
Token minted to: 0xAcb913db781a46611fAa04Ff6Cb9A370df069eed
```


## Check the information on the minted NFT token
Set the token ID to the `.env` file that you have minted.
```
FINPL_NFT_LAST_COMBINE_TOKEN_ID=0xacb913db781a46611faa04ff6cb9a370df069eed0000000000005e0000000064
```

Run the script to get information on the minted NFT token.
```
npx hardhat run script/check_nft.ts --network testnet
```

And you get the information.
```
====== Minted NFT information ======
tokenId: BigNumber { value: "78124813713363012903054561010911293954183699126175542122344455273147682259044" }
tokenId(HEX): 0xacb913db781a46611faa04ff6cb9a370df069eed0000000000005e0000000064
uri: https://ipfs.io/ipfs/QmXdYWxw3di8Uys9fmWTmdariUoUgBCsdVfHtseL2dtEP7
creator: 0xAcb913db781a46611fAa04Ff6Cb9A370df069eed
token index: 94
max supply: 100
balance of creator: 100
```

# Transfer of AssetContractShared Tokens with Seaport
There are three ways of fulfilling an order for trading `AssetContractShared` tokens.
1. Fulfill an order through the `Seaport` and `SharedStorefrontLazyMintAdapter` contracts.
2. Fulfill an order through the `Seaport` and `Conduit` and `SharedStorefrontLazyMintAdapter` contracts.
3. Fulfill an order through the `Seaport` contract.

We describe how to use scripts to fulfill an order and check it in three ways. 

This description is the steps for trading NFTs in [TestNet](https://testnet.boascan.io).

## Prerequisites
You should set the token ID which you want to trade in the following commands.
```
FINPL_NFT_LAST_COMBINE_TOKEN_ID=29534064577826613153035026441167017977610697301918714276122831730638822834376
```

And you should also set the keys of the NFT buyer and the NFT buyer in the `.env` file. You should copy the `.env.sample` to the `.env` file if there is no `.env` file in your local environment.

```
ORDER_NFT_BUYER_KEY=0x158ad623fa14d8ca6bce416b877905b2d11d3842ddd4adbb71332e809263abb5
ORDER_NFT_SELLER_KEY=0xbacfa3fbe768c1665feee09af7182ae53ca9a334db747b3751149f81e448ac26
```

- `ORDER_NFT_BUYER_KEY` is for the key of the buyer who creates an order having an offer of BOAs and WBOAs, or fulfills the order. 
- `ORDER_NFT_SELLER_KEY` is for the key of the seller who fulfills an order from the seller or creates an order having NFT tokens he/she owns.

You should check the balances of the offerer and fulfiller for the token ID with the following command.
```
npx hardhat run script/fulfill/check_fulfill_order.ts --network testnet
```
And you can get the following information about balances of BOA, WBOA, and NFTs for the offerer and fulfiller from the network.
```
====== Asset Token
contract address: 0x2fddd0f488B767E8Dd42aE4E60f0685A2e15b1Fd
NFT creator: 0x414BB02bDe65Ba63c9A99709b388E30669Bf2De7
====== NFT seller
address: 0x414BB02bDe65Ba63c9A99709b388E30669Bf2De7
BOA     : 11056865472547138871909
WBOA    : 5100000000000000000
Asset amount    : 87
====== NFT buyer
address: 0x214a3aE4f8A245197db523fb81Dd8aD93c1c7B53
BOA     : 995179832817305886482
WBOA    : 1200000000000000000
Asset amount    : 113
```

We summarize the addresses for the contracts that are used frequently in this document.
```
0x8a8f3d7b1D6Eebe8D227499B563bD0319Ec8CBC0: SharedStorefrontLazyMintAdapter
0x7700a9Bc2c4a523EFFd6B506b6f78872F247161C: WBOA
0x2fddd0f488B767E8Dd42aE4E60f0685A2e15b1Fd: AssetContractShared 
```

## Fulfill through the Seaport and SharedStorefrontLazyMintAdapter without Conduit
### Offer NFT and receive BOA as consideration
This describes the steps for fulfilling an order that consists of an offer having an `AssetContractShard` NFT and a consideration having 0.1 `BOA` through `Seaport` and `SharedStorefrontLazyMintAdapter` contracts.

You should check the balances of the offerer and fulfiller with this command before fulfilling an order.
```
npx hardhat run script/fulfill/check_fulfill_order.ts --network testnet
```
And run this command for fulfilling an order.
```
npx hardhat run script/fulfill/order_seaport_erc1155_to_boa.ts --network testnet
```
The details of the order are as follows.
```
order: {
    parameters: {
        offerer: '0x214a3aE4f8A245197db523fb81Dd8aD93c1c7B53',
        zone: '0x0000000000000000000000000000000000000000',
        offer: [ [Object] ],
        consideration: [ [Object] ],
        totalOriginalConsiderationItems: 1,
        orderType: 0,
        zoneHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
        salt: '0x1c667696c5673688edb7b0ed3f7e9f25664879fb65446dffec4762e34b8fb6f6',
        conduitKey: '0x0000000000000000000000000000000000000000000000000000000000000000',
        startTime: 0,
        endTime: BigNumber { value: "5172014448931175958106549077934080" }
    },
    signature: '0xa7662b3c63c564ca84d5d666bb15b38789759736ca5daab4993a68b9c1928ad41cdefddba6a6e283070401006c61aa012ff7339d2526f4d69e7fb60cd1e284bb1b',
    numerator: 1,
    denominator: 1,
    extraData: '0x'
}
```
```
offer: [
{
    itemType: 3,
    token: '0x8a8f3d7b1D6Eebe8D227499B563bD0319Ec8CBC0',
    identifierOrCriteria: BigNumber { value: "78124813713363012903054561010911293954183699126175542122344455181888217153636" },
    startAmount: BigNumber { value: "1" },
    endAmount: BigNumber { value: "1" }
}
]
```
```
consideration: [
{
    itemType: 0,
    token: '0x0000000000000000000000000000000000000000',
    identifierOrCriteria: BigNumber { value: "0" },
    startAmount: BigNumber { value: "100000000000000000" },
    endAmount: BigNumber { value: "100000000000000000" },
    recipient: '0x214a3aE4f8A245197db523fb81Dd8aD93c1c7B53'
}
]
```

You should check the result of fulfilling an order with the `check_fulfill_order.ts` script as you had checked the balances of the offerer and buyer before fulfilling the order.
```
npx hardhat run script/fulfill/check_fulfill_order.ts --network testnet
```

### Offer WBOA and receive NFT as consideration
This describes fulfilling an order that consists of an offer having an 0.1 `WBOA` and a consideration having an `NFT` token.

You should check the balances of the offerer and fulfiller with this command.
```
npx hardhat run script/fulfill/check_fulfill_order.ts --network testnet
```
And run this command for fulfilling an order.
```
npx hardhat run script/fulfill/order_seaport_wboa_to_erc1155.ts --network testnet
```
The details of the order are as follows.
```
order: {
    parameters: {
        offerer: '0x214a3aE4f8A245197db523fb81Dd8aD93c1c7B53',
        zone: '0x0000000000000000000000000000000000000000',
        offer: [ [Object] ],
        consideration: [ [Object] ],
        totalOriginalConsiderationItems: 1,
        orderType: 1,
        zoneHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
        salt: '0xc7572075feaac4628eeeb0b8383eee2c5693699efa7d6bb87a3f37e36e9a6d69',
        conduitKey: '0x0000000000000000000000000000000000000000000000000000000000000000',
        startTime: 0,
        endTime: BigNumber { value: "5172014448931175958106549077934080" }
    },
    signature: '0x32303a8c8876c47e30e5c89179942b29ebac2743298d6fcaaa94e0d656a9dfab761a087ffb8d7726dfff0c945ebf069c1f66940f3557a86d6247047782627ba01b',
    numerator: 1,
    denominator: 1,
    extraData: '0x'
}
```
```
offer: [
{
    itemType: 1,
    token: '0x7700a9Bc2c4a523EFFd6B506b6f78872F247161C',
    identifierOrCriteria: BigNumber { value: "0" },
    startAmount: BigNumber { value: "100000000000000000" },
    endAmount: BigNumber { value: "100000000000000000" }
}
]

```
```
consideration: [
{
    itemType: 3,
    token: '0x8a8f3d7b1D6Eebe8D227499B563bD0319Ec8CBC0',
    identifierOrCriteria: BigNumber { value: "78124813713363012903054561010911293954183699126175542122344455181888217153636" },
    startAmount: BigNumber { value: "1" },
    endAmount: BigNumber { value: "1" },
    recipient: '0x214a3aE4f8A245197db523fb81Dd8aD93c1c7B53'
}
]
```

You should check the result of fulfilling an order with the `check_fulfill_order.ts` script as you had checked the balances of the offerer and fulfiller before fulfilling the order.
```
npx hardhat run script/fulfill/check_fulfill_order.ts --network testnet 
```

### Offer WBOA and receive NFT that is lazily minted as consideration
This describes fulfilling an order **without any conduit** which consists of an offer having an 0.1 `WBOA` and a consideration having `NFT` tokens that are going to be lazily minted.

Before we get started, we should set the information for lazily minted tokens in the `.env` file as described in [this section](#set-information-for-minting).

You should check the balances of the offerer and fulfiller with this command.
```
npx hardhat run script/fulfill/check_fulfill_order.ts --network testnet
```
And run this command for fulfilling an order.
```
npx hardhat run script/fulfill/order_seaport_wboa_to_erc1155_lazymint.ts --network testnet
```
The details of the order are as follows.
```
order: {
  parameters: {
    offerer: '0x214a3aE4f8A245197db523fb81Dd8aD93c1c7B53',
    zone: '0x0000000000000000000000000000000000000000',
    offer: [ [Object] ],
    consideration: [ [Object] ],
    totalOriginalConsiderationItems: 1,
    orderType: 1,
    zoneHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
    salt: '0xe1ea5147e95f8f98887220b3aedf7940b7524d4f20aefe03b6bdc3c2e7396a31',
    conduitKey: '0x0000000000000000000000000000000000000000000000000000000000000000',
    startTime: 0,
    endTime: BigNumber { value: "5172014448931175958106549077934080" }
  },
  signature: '0x45e85622f37be9d0703cee52225ecefb41acae873ef2df295b386393a5d9e5236eb0c204f333daa769ccd22822ed120888c84d59a8cb87d43e3f8efe69cb011f1b',
  numerator: 1,
  denominator: 1,
  extraData: '0x'
}
```
```
offer: [
  {
    itemType: 1,
    token: '0x7700a9Bc2c4a523EFFd6B506b6f78872F247161C',
    identifierOrCriteria: BigNumber { value: "0" },
    startAmount: BigNumber { value: "100000000000000000" },
    endAmount: BigNumber { value: "100000000000000000" }
  }
]
```

```
consideration: [
  {
    itemType: 3,
    token: '0x790c4c73155F89F93ad18e3b3B483B688E867c4b',
    identifierOrCriteria: BigNumber { value: "29534064577826613153035026441167017977610697301918714276122832834548497121480" },
    startAmount: BigNumber { value: "1" },
    endAmount: BigNumber { value: "1" },
    recipient: '0x214a3aE4f8A245197db523fb81Dd8aD93c1c7B53'
  }
]
```

You should check the result of fulfilling an order with the `check_fulfill_order.ts` script as you had check the balances of the offerer and fulfiller before fulfilling the order.
```
npx hardhat run script/fulfill/check_fulfill_order.ts --network testnet 
```

### Offer NFT that is lazily minted and receive BOA as consideration
This describes the steps for fulfilling an order **without any conduit** that consists of an offer having an `AssetContractShard` NFT and a consideration having 0.1 `BOA` through `Seaport` and `SharedStorefrontLazyMintAdapter` contracts.

Before we get started, we should set the information for lazily minted tokens in the `.env` file as described in [this section](#set-information-for-minting).

You should check the balances of the offerer and fulfiller with this command before fulfilling an order.
```
npx hardhat run script/fulfill/check_fulfill_order.ts --network testnet
```
And run this command for fulfilling an order.
```
npx hardhat run script/fulfill/order_seaport_erc1155_to_boa_lazymint.ts --network testnet
```
The details of the order are as follows.
```
order: {
  parameters: {
    offerer: '0x414BB02bDe65Ba63c9A99709b388E30669Bf2De7',
    zone: '0x0000000000000000000000000000000000000000',
    offer: [ [Object] ],
    consideration: [ [Object] ],
    totalOriginalConsiderationItems: 1,
    orderType: 0,
    zoneHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
    salt: '0x7055472912195a36c3fc4e4e3faeeec05d8b42f9bc2e45c4ee5d2af8d7315ac8',
    conduitKey: '0x0000000000000000000000000000000000000000000000000000000000000000',
    startTime: 0,
    endTime: BigNumber { value: "5172014448931175958106549077934080" }
  },
  signature: '0xd7b3ab659dbd3410358a5c083b39649785a223d0f05867a69243a3598d456804070ac60b05a1ea506718b820b0a6bfd31b18cf7903af3a7dea737bcaf1a43a2c1c',
  numerator: 1,
  denominator: 1,
  extraData: '0x'
}
```
```
offer: [
  {
    itemType: 3,
    token: '0x790c4c73155F89F93ad18e3b3B483B688E867c4b',
    identifierOrCriteria: BigNumber { value: "29534064577826613153035026441167017977610697301918714276122833929662078386376" },
    startAmount: BigNumber { value: "1" },
    endAmount: BigNumber { value: "1" }
  }
]
```
```
consideration: [
  {
    itemType: 0,
    token: '0x0000000000000000000000000000000000000000',
    identifierOrCriteria: BigNumber { value: "0" },
    startAmount: BigNumber { value: "100000000000000000" },
    endAmount: BigNumber { value: "100000000000000000" },
    recipient: '0x414BB02bDe65Ba63c9A99709b388E30669Bf2De7'
  }
]
```

You should check the result of fulfilling an order with the `check_fulfill_order.ts` script as you had checked the balances of the offerer and buyer before fulfilling the order.
```
npx hardhat run script/fulfill/check_fulfill_order.ts --network testnet
```

## Fulfill through the Seaport, Conduit, and SharedStorefrontLazyMintAdapter
### Offer WBOA and receive NFT as consideration
This describes fulfilling an order **through a default conduit** which consists of an offer having an 0.1 `WBOA` and a consideration having an `NFT` token.

You should check the balances of the offerer and fulfiller with this command.
```
npx hardhat run script/fulfill/check_fulfill_order.ts --network testnet
```
And run this command for fulfilling an order.
```
npx hardhat run script/fulfill/order_conduit_wboa_to_erc1155.ts --network testnet
```
The details of the order are as follows. You can see that we are using the default conduit key for which we have created a Conduit contract.
```
order: {
  parameters: {
    offerer: '0x214a3aE4f8A245197db523fb81Dd8aD93c1c7B53',
    zone: '0x0000000000000000000000000000000000000000',
    offer: [ [Object] ],
    consideration: [ [Object] ],
    totalOriginalConsiderationItems: 1,
    orderType: 1,
    zoneHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
    salt: '0x9f91dd2c2eb0c404bbc70c3d8a9395b14a1541fb6b905bb4f4355f1ea18f3e6f',
    conduitKey: '0x82fFb1bB229552D020C88b9eE8D5e4042E6Cbd42000000000000000000000000',
    startTime: 0,
    endTime: BigNumber { value: "5172014448931175958106549077934080" }
  },
  signature: '0x450b76f99f3e14c079cd0af21018bac9ca2eb0e6d3e1ffb27a189f478462554d237a6b7c20bf1b7c7ac0ba48531ce09c701264edf6a4586df899f6b6568e7ef41c',
  numerator: 1,
  denominator: 1,
  extraData: '0x'
}
```
```
offer: [
  {
    itemType: 1,
    token: '0x7700a9Bc2c4a523EFFd6B506b6f78872F247161C',
    identifierOrCriteria: BigNumber { value: "0" },
    startAmount: BigNumber { value: "100000000000000000" },
    endAmount: BigNumber { value: "100000000000000000" }
  }
]
```

```
consideration: [
  {
    itemType: 3,
    token: '0x5Ea2E76D2CEA6051bdd1D41eBAebF069BA973642',
    identifierOrCriteria: BigNumber { value: "29534064577826613153035026441167017977610697301918714276122830631127195058376" },
    startAmount: BigNumber { value: "1" },
    endAmount: BigNumber { value: "1" },
    recipient: '0x214a3aE4f8A245197db523fb81Dd8aD93c1c7B53'
  }
]
```

You should check the result of fulfilling an order with the `check_fulfill_order.ts` script as you had check the balances of the offerer and fulfiller before fulfilling the order.
```
npx hardhat run script/fulfill/check_fulfill_order.ts --network testnet 
```


### Offer WBOA and receive NFT that is lazily minted as consideration
This describes fulfilling an order **through a default conduit** which consists of an offer having an 0.1 `WBOA` and a consideration having `NFT` tokens that are going to be lazily minted.

Before we get started, we should set the information for lazily minted tokens in the `.env` file as described in [this section](#set-information-and-mint-an-nft-token).

You should check the balances of the offerer and fulfiller with this command.
```
npx hardhat run script/fulfill/check_fulfill_order.ts --network testnet
```
And run this command for fulfilling an order.
```
npx hardhat run script/fulfill/order_lazymint_wboa_to_erc1155.ts --network testnet
```
The details of the order are as follows. You can see that we are using the default conduit key for which we are create a Conduit contract.
```
order: {
  parameters: {
    offerer: '0x214a3aE4f8A245197db523fb81Dd8aD93c1c7B53',
    zone: '0x0000000000000000000000000000000000000000',
    offer: [ [Object] ],
    consideration: [ [Object] ],
    totalOriginalConsiderationItems: 1,
    orderType: 1,
    zoneHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
    salt: '0x9f91dd2c2eb0c404bbc70c3d8a9395b14a1541fb6b905bb4f4355f1ea18f3e6f',
    conduitKey: '0x82fFb1bB229552D020C88b9eE8D5e4042E6Cbd42000000000000000000000000',
    startTime: 0,
    endTime: BigNumber { value: "5172014448931175958106549077934080" }
  },
  signature: '0x450b76f99f3e14c079cd0af21018bac9ca2eb0e6d3e1ffb27a189f478462554d237a6b7c20bf1b7c7ac0ba48531ce09c701264edf6a4586df899f6b6568e7ef41c',
  numerator: 1,
  denominator: 1,
  extraData: '0x'
}
```
```
offer: [
  {
    itemType: 1,
    token: '0x7700a9Bc2c4a523EFFd6B506b6f78872F247161C',
    identifierOrCriteria: BigNumber { value: "0" },
    startAmount: BigNumber { value: "100000000000000000" },
    endAmount: BigNumber { value: "100000000000000000" }
  }
]
```

```
consideration: [
  {
    itemType: 3,
    token: '0x5Ea2E76D2CEA6051bdd1D41eBAebF069BA973642',
    identifierOrCriteria: BigNumber { value: "29534064577826613153035026441167017977610697301918714276122830631127195058376" },
    startAmount: BigNumber { value: "1" },
    endAmount: BigNumber { value: "1" },
    recipient: '0x214a3aE4f8A245197db523fb81Dd8aD93c1c7B53'
  }
]
```

You should check the result of fulfilling an order with the `check_fulfill_order.ts` script as you had check the balances of the offerer and fulfiller before fulfilling the order.
```
npx hardhat run script/fulfill/check_fulfill_order.ts --network testnet 
```

## Fulfill only through the Seaport
This describes the steps for fulfilling an order that consists of an offer having an `AssetContractShard` NFT and a consideration having 0.1 `BOA` through the `Seaport` contract without `SharedStorefrontLazyMintAdapter` or `Conduit` contracts.
```
npx hardhat run script/fulfill/order_asset_erc1155_to_boa.ts --network testnet
```
The order will have similar components as follows.
```
order: {
    parameters: {
        offerer: '0x214a3aE4f8A245197db523fb81Dd8aD93c1c7B53',
        zone: '0x0000000000000000000000000000000000000000',
        offer: [ [Object] ],
        consideration: [ [Object] ],
        totalOriginalConsiderationItems: 1,
        orderType: 0,
        zoneHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
        salt: '0xa4d4c932828059d2d949ec7744af51c6e5251c8e50666faee7304f361bb609d2',
        conduitKey: '0x0000000000000000000000000000000000000000000000000000000000000000',
        startTime: 0,
        endTime: BigNumber { value: "5172014448931175958106549077934080" }
    },
    signature: '0x084439a1775805d19ca7bd0dc5e626bbf5f355d6f7c0c57df475f37fa40f2fb01c3db8b1a6832b1c311d1b852a0be913d966af8fb18eeeb1ab1ecd7d9b6f63a11c',
    numerator: 1,
    denominator: 1,
    extraData: '0x'
}

```
```
offer: [
{
    itemType: 3,
    token: '0x2fddd0f488B767E8Dd42aE4E60f0685A2e15b1Fd',
    identifierOrCriteria: BigNumber { value: "78124813713363012903054561010911293954183699126175542122344455181888217153636" },
    startAmount: BigNumber { value: "1" },
    endAmount: BigNumber { value: "1" }
}
]
```
```
consideration: [
{
    itemType: 0,
    token: '0x0000000000000000000000000000000000000000',
    identifierOrCriteria: BigNumber { value: "0" },
    startAmount: BigNumber { value: "100000000000000000" },
    endAmount: BigNumber { value: "100000000000000000" },
    recipient: '0x214a3aE4f8A245197db523fb81Dd8aD93c1c7B53'
}
]

```

You should check the result with the `check_fulfill_order.ts` script as you had checked the status of the offerer and fulfiller before fulfilling the order.
```
npx hardhat run script/fulfill/check_fulfill_order.ts --network testnet
```
