const express = require("express");
const { ethers } = require("ethers");
require("dotenv").config();

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const PORT = process.env.PORT || 10000;

// =======================
// ENV
// =======================
const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

if (!RPC_URL || !PRIVATE_KEY || !CONTRACT_ADDRESS) {
  console.error("❌ Missing ENV variables");
  process.exit(1);
}

// =======================
// PROVIDER + WALLET
// =======================
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// =======================
// CONTRACT ABI (MINIMAL)
// =======================
const ABI = [
  "function birthProduct(string,string,string,string,string,string)"
];

const contract = new ethers.Contract(
  CONTRACT_ADDRESS,
  ABI,
  wallet
);

// =======================
// HOME PAGE
// =======================
app.get("/", (req, res) => {
  res.send(`
    <h1>ASJUJ TAAS PANEL</h1>
    <form method="POST" action="/create">
      <input name="gpid" placeholder="GPID" required /><br/>
      <input name="brand" placeholder="Brand" required /><br/>
      <input name="model" placeholder="Model" required /><br/>
      <input name="category" placeholder="Category" required /><br/>
      <input name="factory" placeholder="Factory" required /><br/>
      <input name="batch" placeholder="Batch" required /><br/><br/>
      <button type="submit">Create Product</button>
    </form>
  `);
});

// =======================
// CREATE PRODUCT
// =======================
app.post("/create", async (req, res) => {
  try {
    const { gpid, brand, model, category, factory, batch } = req.body;

    const tx = await contract.birthProduct(
      gpid,
      brand,
      model,
      category,
      factory,
      batch
    );

    const receipt = await tx.wait();

    res.send(`
      <h2>✔ Product Created</h2>
      <p><b>GPID:</b> ${gpid}</p>
      <p><b>TX:</b> ${tx.hash}</p>
      <p><b>Block:</b> ${receipt.blockNumber}</p>
      <a href="/">Create Another</a>
    `);
  } catch (err) {
    res.send(`
      <h2>❌ Error</h2>
      <pre>${err.reason || err.message}</pre>
      <a href="/">Back</a>
    `);
  }
});

// =======================
// START SERVER
// =======================
app.listen(PORT, () => {
  console.log("========== TAAS PANEL ==========");
  console.log("Wallet:", wallet.address);
  console.log("Contract:", CONTRACT_ADDRESS);
  console.log("================================");
  console.log("TAAS Panel running on", PORT);
});