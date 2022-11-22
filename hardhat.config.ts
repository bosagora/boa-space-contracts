import * as dotenv from "dotenv";
import { Wallet, utils } from "ethers";
import { task } from "hardhat/config";

import type { HardhatUserConfig } from "hardhat/config";
import type { HardhatNetworkAccountUserConfig } from "hardhat/types/config";

import "dotenv/config";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-etherscan";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";

dotenv.config({ path: "env/.env" });

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

function getAccounts() {
  const accounts: HardhatNetworkAccountUserConfig[] = [];
  const defaultBalance = utils.parseEther("2000000").toString();

  const n = 10;
  for (let i = 0; i < n; ++i) {
    accounts.push({
      privateKey: Wallet.createRandom().privateKey,
      balance: defaultBalance,
    });
  }
  accounts[0].privateKey = process.env.ADMIN_KEY ?? "";
  accounts[1].privateKey = process.env.USER_KEY ?? "";
  accounts[2].privateKey = process.env.OWNER_KEY ?? "";
  accounts[3].privateKey = process.env.ZONE_KEY ?? "";
  accounts[4].privateKey = process.env.BUYER_KEY ?? "";

  return accounts;
}

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.14",
        settings: {
          viaIR: true,
          optimizer: {
            enabled: true,
            runs: 18000,
          },
        },
      },
    ],
    overrides: {
      "contracts/conduit/Conduit.sol": {
        version: "0.8.14",
        settings: {
          viaIR: true,
          optimizer: {
            enabled: true,
            runs: 1000000,
          },
        },
      },
      "contracts/conduit/ConduitController.sol": {
        version: "0.8.14",
        settings: {
          viaIR: true,
          optimizer: {
            enabled: true,
            runs: 1000000,
          },
        },
      },
      "contracts/helper/TransferHelper.sol": {
        version: "0.8.14",
        settings: {
          viaIR: true,
          optimizer: {
            enabled: true,
            runs: 1000000,
          },
        },
      },
    },
  },
  networks: {
    hardhat: {
      accounts: getAccounts(),
    },
    mainnet: {
      url: process.env.MAINNET_URL ?? "",
      chainId: 2151,
      accounts: [
        process.env.ADMIN_KEY ?? "",
        process.env.USER_KEY ?? "",
        process.env.OWNER_KEY ?? "",
        process.env.ZONE_KEY ?? "",
        process.env.BUYER_KEY ?? "",
      ],
    },
    testnet: {
      url: process.env.TESTNET_URL ?? "",
      chainId: 2019,
      accounts: [
        process.env.ADMIN_KEY ?? "",
        process.env.USER_KEY ?? "",
        process.env.OWNER_KEY ?? "",
        process.env.ZONE_KEY ?? "",
        process.env.BUYER_KEY ?? "",
      ],
    },
    goerli: {
      url: process.env.GOERLI_URL ?? "",
      chainId: 5,
      accounts: [
        process.env.ADMIN_KEY ?? "",
        process.env.USER_KEY ?? "",
        process.env.OWNER_KEY ?? "",
        process.env.ZONE_KEY ?? "",
        process.env.BUYER_KEY ?? "",
      ],
    },
    localnet: {
      url: process.env.LOCALNET_URL ?? "",
      chainId: 34559,
      accounts: [
        process.env.ADMIN_KEY ?? "",
        process.env.USER_KEY ?? "",
        process.env.OWNER_KEY ?? "",
        process.env.ZONE_KEY ?? "",
        process.env.BUYER_KEY ?? "",
      ],
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
};

export default config;
