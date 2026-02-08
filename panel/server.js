// ===============================
// TAAS PANEL — CLEAN & STABLE
// ===============================

const express = require("express");
const { ethers } = require("ethers");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 10000;

// ===============================
// ENV (REQUIRED)
// ===============================

const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

if (!RPC_URL || !PRIVATE_KEY || !CONTRACT_ADDRESS) {
  console.error("❌ Missing ENV variables");
  process.exit(1);
}

// ===============================
// PROVIDER + WALLET
// ===============================

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

console.log("========== TAAS PANEL ==========");
console.log("Wallet:", wallet.address);
console.log("Contract:", CONTRACT_ADDRESS);
console.log("================================");

// ===============================
// MINIMAL ABI (WRITE ONLY)
// ===============================

const ABI = [
  "function birthProduct(string,string,string,string,string,string)"
];

const contract = new ethers.Contract(
  CONTRACT_ADDRESS,
  ABI,
  wallet
);

// ===============================
// HEALTH CHECK
// ===============================

app.get("/", (req, res) => {
  res.send("TAAS Panel is running");
});

// ===============================
// CREATE PRODUCT (NO WAIT)
// ===============================

app.post("/create", async (req, res) => {
  try {
    const { gpid, brand, model, category, factory, batch } = req.body;

    if (!gpid || !brand || !model) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const tx = await contract.birthProduct(
      gpid,
      brand,
      model,
      category,
      factory,
      batch,
      {
        gasLimit: 300000
      }
    );

    console.log("✅ TX SENT:", tx.hash);

    // DO NOT wait for mining
    return res.json({
      success: true,
      gpid,
      tx: tx.hash,
      note: "Transaction broadcasted"
    });

  } catch (err) {
    console.error("❌ CREATE ERROR:", err.message);
    return res.status(500).json({
      error: err.reason || err.message || "Transaction failed"
    });
  }
});

// ===============================
// START SERVER
// ===============================

app.listen(PORT, () => {
  console.log("TAAS Panel running on", PORT);
});