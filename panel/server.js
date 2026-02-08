const express = require("express");
const { ethers } = require("ethers");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 10000;

/* =====================
   ENV
===================== */
const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

if (!RPC_URL || !PRIVATE_KEY || !CONTRACT_ADDRESS) {
  console.error("❌ Missing ENV variables");
  process.exit(1);
}

/* =====================
   PROVIDER & WALLET
===================== */
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

/* =====================
   CONTRACT ABI (ONLY WHAT WE USE)
===================== */
const ABI = [
  "function birthProduct(string,string,string,string,string,string)"
];

const contract = new ethers.Contract(
  CONTRACT_ADDRESS,
  ABI,
  wallet
);

/* =====================
   ROOT CHECK (FOR BROWSER)
===================== */
app.get("/", (req, res) => {
  res.send("TAAS Panel is running");
});

/* =====================
   CREATE PRODUCT
===================== */
app.post("/create", async (req, res) => {
  try {
    const { gpid, brand, model, category, factory, batch } = req.body;

    if (!gpid || !brand || !model) {
      return res.status(400).send("Missing required fields");
    }

    const tx = await contract.birthProduct(
      gpid,
      brand,
      model,
      category || "",
      factory || "",
      batch || "",
      {
        gasLimit: 220000,                     // 🔽 MIN SAFE
        maxFeePerGas: ethers.parseUnits("35", "gwei"),
        maxPriorityFeePerGas: ethers.parseUnits("2", "gwei")
      }
    );

    const receipt = await tx.wait();

    res.json({
      success: true,
      gpid,
      tx: receipt.hash,
      block: receipt.blockNumber
    });

  } catch (err) {
    console.error("❌ CREATE ERROR:", err);
    res.status(500).send(err.reason || err.message);
  }
});

/* =====================
   START SERVER
===================== */
app.listen(PORT, () => {
  console.log("========== TAAS PANEL ==========");
  console.log("Wallet:", wallet.address);
  console.log("Contract:", CONTRACT_ADDRESS);
  console.log("TAAS Panel running on", PORT);
  console.log("================================");
});