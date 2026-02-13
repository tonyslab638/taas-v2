const express = require("express");
const { ethers } = require("ethers");
require("dotenv").config();

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const PORT = process.env.PORT || 10000;

const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

if (!RPC_URL || !PRIVATE_KEY || !CONTRACT_ADDRESS) {
  console.error("❌ Missing ENV variables");
  process.exit(1);
}

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

const ABI = [
  "function createProduct(string,string,string,string,string,string)"
];

const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

app.get("/", (req, res) => {
  res.send(`
    <h1>ASJUJ NETWORK — TAAS PANEL</h1>
    <form method="POST" action="/create">
      <input name="gpid" placeholder="GPID" required/><br/><br/>
      <input name="brand" placeholder="Brand" required/><br/><br/>
      <input name="model" placeholder="Model" required/><br/><br/>
      <input name="category" placeholder="Category" required/><br/><br/>
      <input name="factory" placeholder="Factory" required/><br/><br/>
      <input name="batch" placeholder="Batch" required/><br/><br/>
      <button type="submit">Create Product</button>
    </form>
  `);
});

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

    const receipt = await tx.wait();

    res.send(`
      <h2>✅ Product Created</h2>
      <p>GPID: ${gpid}</p>
      <p>TX: ${receipt.hash}</p>
      <a href="/">Create Another</a>
    `);

  } catch (err) {
    console.error(err);
    res.send(`<h2>❌ Error</h2><pre>${err.message}</pre>`);
  }
});

app.listen(PORT, () => {
  console.log("====================================");
  console.log("TAAS PANEL — SEPOLIA");
  console.log("Wallet:", wallet.address);
  console.log("Contract:", CONTRACT_ADDRESS);
  console.log("====================================");
  console.log("Running on port", PORT);
});