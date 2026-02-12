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
  console.error("❌ Missing environment variables");
  process.exit(1);
}

// =======================
// PROVIDER + WALLET
// =======================

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// =======================
// CONTRACT ABI
// =======================

const ABI = [
  "function birthProduct(string,string,string,string,string,string)"
];

const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

// =======================
// UI
// =======================

app.get("/", (req, res) => {
  res.send(`
    <h2>ASJUJ Network - Create Product</h2>
    <form method="POST" action="/create">
      GPID: <input name="gpid" required /><br/><br/>
      Brand: <input name="brand" required /><br/><br/>
      Model: <input name="model" required /><br/><br/>
      Category: <input name="category" required /><br/><br/>
      Factory: <input name="factory" required /><br/><br/>
      Batch: <input name="batch" required /><br/><br/>
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

    const feeData = await provider.getFeeData();

    const tx = await contract.birthProduct(
      gpid,
      brand,
      model,
      category,
      factory,
      batch,
      {
        gasLimit: 300000,
        maxFeePerGas: feeData.maxFeePerGas,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas
      }
    );

    res.send(`
      <h3>✅ Product Created</h3>
      GPID: ${gpid}<br/><br/>
      TX: ${tx.hash}<br/><br/>
      <a href="/">Create Another</a>
    `);

  } catch (err) {
    console.error(err);
    res.send(`
      <h3>❌ Error</h3>
      ${err.reason || err.message}
      <br/><br/>
      <a href="/">Back</a>
    `);
  }
});

app.listen(PORT, () => {
  console.log("========== TAAS PANEL ==========");
  console.log("Wallet:", wallet.address);
  console.log("Contract:", CONTRACT_ADDRESS);
  console.log("================================");
  console.log("TAAS Panel running on", PORT);
});