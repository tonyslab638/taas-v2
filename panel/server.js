const express = require("express");
const { ethers } = require("ethers");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 10000;

// =======================
// ENV (Render Variables)
// =======================
const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

// =======================
// PROVIDER + WALLET
// =======================
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// =======================
// ABI (ONLY WHAT WE USE)
// =======================
const ABI = [
  "function birthProduct(string,string,string,string,string,string)"
];

const contract = new ethers.Contract(
  CONTRACT_ADDRESS,
  ABI,
  wallet
);

console.log("========== TAAS PANEL (GAS SAFE) ==========");
console.log("Wallet:", wallet.address);
console.log("Contract:", CONTRACT_ADDRESS);
console.log("==========================================");

// =======================
// UI (VERY SIMPLE)
// =======================
app.get("/", (req, res) => {
  res.send(`
    <h2>ASJUJ Product Creation</h2>
    <form method="POST" action="/create">
      <input name="gpid" placeholder="GPID" required /><br/>
      <input name="brand" placeholder="Brand" required /><br/>
      <input name="model" placeholder="Model" required /><br/>
      <input name="category" placeholder="Category" required /><br/>
      <input name="factory" placeholder="Factory" required /><br/>
      <input name="batch" placeholder="Batch" required /><br/>
      <button>Create Product</button>
    </form>
  `);
});

// =======================
// CREATE PRODUCT (FORCED GAS)
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
      batch,
      {
        gasLimit: 600000, // FORCE
        maxFeePerGas: ethers.parseUnits("80", "gwei"),
        maxPriorityFeePerGas: ethers.parseUnits("40", "gwei")
      }
    );

    console.log("TX SENT:", tx.hash);

    res.send(`
      <h3>✅ Product Submitted</h3>
      <p>TX: ${tx.hash}</p>
      <p>⏳ Wait 1–2 minutes, then verify.</p>
      <a href="/">Create Another</a>
    `);

  } catch (err) {
    console.error(err);
    res.send(`
      <h3>❌ Error</h3>
      <pre>${err.message}</pre>
      <a href="/">Back</a>
    `);
  }
});

app.listen(PORT, () => {
  console.log("TAAS Panel running on", PORT);
});