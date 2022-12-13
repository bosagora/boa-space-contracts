# NFT Transfer Test
There are three ways of fulfilling an order for trading `AssetContractShared` tokens.
1. Fulfill an order through the `Seaport` and `SharedStorefrontLazyMintAdapter` contracts.
2. Fulfill an order through the `Seaport` and `Conduit` and `SharedStorefrontLazyMintAdapter` contracts.
3. Fulfill an order through the `Seaport` contract.

We describe how to use scripts to fulfill an order and check it for the three ways. 

This description is the steps for trading NFTs in [TestNet](https://testnet.boascan.io).

## Prerequisites
You should set the keys of the seller(=offerer) and the buyer(=fulfiller) in the `.env` file. You should copy the `.env.sample` to `.env` file if there is no `.env` file in your local environment.

```typescript
# Fulfilling an Order
ORDER_SELLER_KEY=0x158ad623fa14d8ca6bce416b877905b2d11d3842ddd4adbb71332e809263abb5
ORDER_BUYER_KEY=0xbacfa3fbe768c1665feee09af7182ae53ca9a334db747b3751149f81e448ac26
```

- `ORDER_SELLER_KEY` is for the key of the seller(=offerer) who creates an order having an offer of BOAs, WBOAs, or ERC1155 compatible tokens with considerations that could have same kind of tokens as offer.
- `ORDER_BUYER_KEY` is for the key of the buyer(=fulfiller) who fulfill an order, which means that the fulfiller gives the consideration in response to getting the offer. 

You should check the balances of the seller and buyer with the following command.
```typescript
npx hardhat run script/fulfill/check_fulfill.ts --network testnet
```
And you can get the following information about balances of BOA, WBOA, and NFTs for the seller and buyer from the network.
```
====== Seller balance   : 0x214a3aE4f8A245197db523fb81Dd8aD93c1c7B53
BOA     : 21991018220158085028
WBOA    : 3000000000000000000
NFT(0x2fddd0f488B767E8Dd42aE4E60f0685A2e15b1Fd) : 33
====== Buyer balance    : 0xAcb913db781a46611fAa04Ff6Cb9A370df069eed
BOA     : 9960988147586444737674
WBOA    : 31000000000000000000
NFT(0x2fddd0f488B767E8Dd42aE4E60f0685A2e15b1Fd) : 17
```

We summarize the addresses for the contracts that are used frequently in this document.
```
0x8a8f3d7b1D6Eebe8D227499B563bD0319Ec8CBC0: SharedStorefrontLazyMintAdapter
0x7700a9Bc2c4a523EFFd6B506b6f78872F247161C: WBOA
0x2fddd0f488B767E8Dd42aE4E60f0685A2e15b1Fd: AssetContractShared 
```

## 1. Fulfill through the `Seaport` and `SharedStorefrontLazyMintAdapter`
### 1.1. Offer NFT and receive BOA as consideration
This describes the steps for fulfilling an order that consists of an offer having an `AssetContractShard` NFT and a consideration having 0.1 `BOA` through `Seaport` and `SharedStorefrontLazyMintAdapter` contracts.

You should check the balances of the seller and buyer with this command before fulfilling an order.
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

You should check the result of fulfilling an order with the `check_fulfills.ts` script as you had check the balances of the seller and buyer before fulfilling the order.
```typescript
npx hardhat run script/fulfill/asset_basic_order.ts --network testnet 
```

### 1.2. Offer WBOA and receive NFT as consideration
This describes the fulfilling an order that consists of an offer having an 0.1 `WBOA` and a consideration having a `NFT` token.

You should check the balances of the seller and buyer with this command.
```
npx hardhat run script/fulfill/check_fulfill.ts --network testnet
```
And run this command for fulfilling an order.
```
npx hardhat run script/fulfill/storefront_basic_order_wboa.ts --network testnet
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

You should check the result of fulfilling an order with the `check_fulfills.ts` script as you had check the balances of the seller and buyer before fulfilling the order.
```typescript
npx hardhat run script/fulfill/asset_basic_order.ts --network testnet 
```

## 2. Fulfill through the `Seaport` and `Conduit`
**Will be documented**


## 3. Fulfill through the `Seaport`
This describes the steps for fulfilling an order that consists of an offer having an `AssetContractShard` NFT and a consideration having 0.1 `BOA` through the `Seaport` contract without `SharedStorefrontLazyMintAdapter` or `Conduit` contracts.
```
npx hardhat run script/fulfill/asset_basic_order.ts --network testnet 
```
The order will have the similar components as follows.
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

You should check the result with the `check_fulfills.ts` script as you had check the status of the seller and buyer before fulfilling the order.
```typescript
npx hardhat run script/fulfill/asset_basic_order.ts --network testnet 
```
