import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import "dotenv/config";

const accounts = process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [];

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      viaIR: true
    }
  },
  networks: {
    polygonAmoy: {
      url: "https://rpc-amoy.polygon.technology/",
      accounts
    },
    polygon: {
      url: "https://polygon-rpc.com/",
      accounts
    }
  }
};

export default config;
