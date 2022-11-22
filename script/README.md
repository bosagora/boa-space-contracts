# NFT Transfer Test

This describies the steps for trading in [TestNet](https://testnet.boascan.io).

## Deploying ConduitContraoller contract
Run this script.
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
Run this script.
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

## Deploying BoaTestERC1155 contract for testing
Run this script.
```
npx hardhat run script/deploy_test_erc1155.ts --network testnet
```
You get the result of deploying the contract.
```
TestERC1155 deployed - to: 0x95DeC1a9CfA332C7da111C9ACD28fA11741A743F
```

You should set the deployed address of the `BoaTestERC1155` contract into the `BOA_TEST_ERC1155_ADDRESS` constant in `.env` file.
```
BOA_TEST_ERC1155_ADDRESS=0x95DeC1a9CfA332C7da111C9ACD28fA11741A743F
```

## Trading BoaTestERC1155 a token item
Run this script.
```
npx hardhat run script/trade_test_erc1155.ts --network testnet
```
This command transfers a token item to the buyer (`BUYER_ADDRESS` shown in `.env` file) from the creator (`USER_KEY` shown in `.env` file).

## Check the amount of the token item of creator and buyer
Run this script.
```
npx hardhat run script/check_token_count.ts --network testnet
```
You can seed the amount of the token item that the creator and the buyer have.
```
balance of 0xC64edC529C17D593f5339E02C9055312cE0718B7 : BigNumber { value: "8" }
balance of 0xAcb913db781a46611fAa04Ff6Cb9A370df069eed : BigNumber { value: "2" }
```
