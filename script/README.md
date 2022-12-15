# Contents
- [Deployment of contracts](#deployment-of-contracts)
  - [Deploying ConduitController contract](#deploying-conduitcontraoller-contract)
  - [Deploying Seaport contract](#deploying-seaport-contract)
  - [Deploying SharedStorefrontLazymintAdapter contract](#deploying-sharedstorefrontlazymintadapter-contract)
  - [Deploying AssetContractShared contract](#deploying-assetcontractshared-contract)
- [Minting an AssetContract NFT](#minting-an-assetcontractshared-nft)
  - [Set information and mint an NFT token](#set-information-and-mint-an-nft-token)
  - [Check the information of the minted NFT token](#check-the-information-of-the-minted-nft-token)
- [Transfer of AssetContractShared Tokens with Seaport](#transfer-of-assetcontractshared-tokens-with-seaport)
  - [Prerequisites](#prerequisites)
  - [Fulfill through the Seaport and SharedStorefrontLazyMintAdapter](#fulfill-through-the-seaport-and-sharedstorefrontlazymintadapter)
    - [Offer NFT and receive BOA as consideration](#offer-nft-and-receive-boa-as-consideration)
    - [Offer WBOA and receive NFT as consideration](#offer-wboa-and-receive-nft-as-consideration)
  - [Fulfill through the Seaport and Conduit](#fulfill-through-the-seaport-and-conduit)
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

## Deploying SharedStorefrontLazymintAdapter contract
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

# Minting an AssetContractShared NFT
## Set information and mint an NFT token
You should mint an NFT token before trading. This is a description of how to mint an NFT token. You could mint FINPL tokens also with these commands.

Set the information of the NFT in `.env` file that you want to mint.
```
FINPL_NFT_INDEX=1
FINPL_NFT_QUANTITY=100
FINPL_NFT_DATA=https://ipfs.io/ipfs/QmXdYWxw3di8Uys9fmWTmdariUoUgBCsdVfHtseL2dtEP7
FINPL_NFT_CREATOR_KEY=bacfa3fbe768c1665feee09af7182ae53ca9a334db747b3751149f81e448ac26
FINPL_NFT_CREATOR=0xAcb913db781a46611fAa04Ff6Cb9A370df069eed
```

Run this script to mint an NFT.
```
npx hardhat run script/finpl/mint.ts --network testnet'
```

And you get the result of the minting.
```
Combined tokenId: 78124813713363012903054561010911293954183699126175542122344455273147682259044 ( 0xacb913db781a46611faa04ff6cb9a370df069eed0000000000005e0000000064 )
Token minted to: 0xAcb913db781a46611fAa04Ff6Cb9A370df069eed
```


## Check the information of the minted NFT token
Set the token ID to `.env` file that you have minted.
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
You should set the keys of the offerer and the fulfiller in the `.env` file. You should copy the `.env.sample` to `.env` file if there is no `.env` file in your local environment.

```
# Fulfilling an Order
ORDER_OFFERER_KEY=0x158ad623fa14d8ca6bce416b877905b2d11d3842ddd4adbb71332e809263abb5
ORDER_FULFILLER_KEY=0xbacfa3fbe768c1665feee09af7182ae53ca9a334db747b3751149f81e448ac26
```

- `ORDER_OFFERER_KEY` is for the key of the offerer who creates an order having an offer of BOAs, WBOAs, or ERC1155 compatible tokens with considerations that could have the same kind of tokens as the offer.
- `ORDER_FULFILLER_KEY` is for the key of the fulfiller who fulfills an order, which means that the fulfiller gives the consideration in response to getting the offer. 

You should check the balances of the offerer and fulfiller with the following command.
```typescript
npx hardhat run script/fulfill/check_fulfill.ts --network testnet
```
And you can get the following information about balances of BOA, WBOA, and NFTs for the offerer and fulfiller from the network.
```
====== Asset Token
address: 0x2fddd0f488B767E8Dd42aE4E60f0685A2e15b1Fd
creator: 0xAcb913db781a46611fAa04Ff6Cb9A370df069eed
====== Offerer
address: 0x214a3aE4f8A245197db523fb81Dd8aD93c1c7B53
BOA     : 999888197909644923579
WBOA    : 1900000000000000000
Asset amount    : 1
====== Fulfiller
address: 0xAcb913db781a46611fAa04Ff6Cb9A370df069eed
BOA     : 8966085233549931187837
WBOA    : 35100000000000000000
Asset amount    : 99
```

We summarize the addresses for the contracts that are used frequently in this document.
```
0x8a8f3d7b1D6Eebe8D227499B563bD0319Ec8CBC0: SharedStorefrontLazyMintAdapter
0x7700a9Bc2c4a523EFFd6B506b6f78872F247161C: WBOA
0x2fddd0f488B767E8Dd42aE4E60f0685A2e15b1Fd: AssetContractShared 
```

## Fulfill through the `Seaport` and `SharedStorefrontLazyMintAdapter`
### Offer NFT and receive BOA as consideration
This describes the steps for fulfilling an order that consists of an offer having an `AssetContractShard` NFT and a consideration having 0.1 `BOA` through `Seaport` and `SharedStorefrontLazyMintAdapter` contracts.

You should check the balances of the offerer and fulfiller with this command before fulfilling an order.
```
npx hardhat run script/fulfill/check_fulfill.ts --network testnet
```
And run this command for fulfilling an order.
```
npx hardhat run script/fulfill/storefront_basic_order_erc1155.ts --network testnet
```
The details of the order as follows.
```typescript
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
```typescript
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
```typescript
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

You should check the result of fulfilling an order with the `check_fulfills.ts` script as you had checked the balances of the offerer and buyer before fulfilling the order.
```
npx hardhat run script/fulfill/check_fulfill.ts --network testnet
```

### Offer WBOA and receive NFT as consideration
This describes fulfilling an order that consists of an offer having an 0.1 `WBOA` and a consideration having an `NFT` token.

You should check the balances of the offerer and fulfiller with this command.
```
npx hardhat run script/fulfill/check_fulfill.ts --network testnet
```
And run this command for fulfilling an order.
```
npx hardhat run script/fulfill/storefront_basic_order_wboa.ts --network testnet
```
The details of the order are as follows.
```typescript
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
```typescript
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
```typescript
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

You should check the result of fulfilling an order with the `check_fulfills.ts` script as you had check the balances of the offerer and fulfiller before fulfilling the order.
```
npx hardhat run script/fulfill/check_fulfill.ts --network testnet 
```

## Fulfill through the `Seaport` and `Conduit`
**Will be documented**


## Fulfill only through the `Seaport`
This describes the steps for fulfilling an order that consists of an offer having an `AssetContractShard` NFT and a consideration having 0.1 `BOA` through the `Seaport` contract without `SharedStorefrontLazyMintAdapter` or `Conduit` contracts.
```
npx hardhat run script/fulfill/asset_basic_order_erc1155.ts --network testnet 
```
The order will have similar components as follows.
```typescript
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
```typescript
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
```typescript
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

You should check the result with the `check_fulfills.ts` script as you had checked the status of the offerer and fulfiller before fulfilling the order.
```
npx hardhat run script/fulfill/check_fulfill.ts --network testnet
```
