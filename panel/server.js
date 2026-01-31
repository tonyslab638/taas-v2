const express = require("express");
const { ethers } = require("ethers");
require("dotenv").config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 10000;

// ENV
const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

// Provider + Wallet
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// ABI (ONLY WHAT WE NEED)
const ABI = [
  "function createProduct(string,string,string,string,string,string)"
];

const contract = new ethers.Contract(
  CONTRACT_ADDRESS,
  ABI,
  wallet
);

console.log("========== TAAS PANEL ==========");
console.log("Wallet:", wallet.address);
console.log("Contract:", CONTRACT_ADDRESS);
console.log("================================");

app.post("/create", async (req, res) => {
  try {
    const { gpid, brand, model, category, factory, batch } = req.body;

    const tx = await contract.createProduct(
      gpid,
      brand,
      model,
      category,
      factory,
      batch
    );

    await tx.wait();

    res.json({
      success: true,
      tx: tx.hash
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log("TAAS Panel running on", PORT);
});