require("dotenv").config();
require("@nomicfoundation/hardhat-ethers");

/**
 * Hardhat Configuration for TAAS-V2
 * Compatible with Hardhat 2.x + hardhat-ethers@3.x
 */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },

  networks: {
    amoy: {
      url: process.env.AMOY_RPC,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 80002
    }
  }
};
