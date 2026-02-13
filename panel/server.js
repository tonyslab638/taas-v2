const express = require("express");
const { ethers } = require("ethers");
require("dotenv").config();

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const PORT = process.env.PORT || 10000;

/* ================================
   ENV VARIABLES (Render Settings)
================================ */
const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

/* ================================
   PROVIDER + WALLET
================================ */
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

/* ================================
   CONTRACT ABI (ONLY REQUIRED FN)
================================ */
const ABI = [
  "function birthProduct(string,string,string,string,string,string)"
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

/* ================================
   HOME PAGE
================================ */
app.get("/", (req, res) => {
  res.send(`
    <h1>ASJUJ NETWORK</h1>
    <h2>Create Product</h2>
    <form method="POST" action="/create">
      <input name="gpid" placeholder="GPID" required /><br/><br/>
      <input name="brand" placeholder="Brand" required /><br/><br/>
      <input name="model" placeholder="Model" required /><br/><br/>
      <input name="category" placeholder="Category" required /><br/><br/>
      <input name="factory" placeholder="Factory" required /><br/><br/>
      <input name="batch" placeholder="Batch" required /><br/><br/>
      <button type="submit">Create Product</button>
    </form>
  `);
});

/* ================================
   CREATE PRODUCT
================================ */
app.post("/create", async (req, res) => {
  try {
    const { gpid, brand, model, category, factory, batch } = req.body;

    console.log("Calling birthProduct...");

    const tx = await contract.birthProduct(
      gpid,
      brand,
      model,
      category,
      factory,
      batch
    );

    console.log("TX HASH:", tx.hash);

    const receipt = await tx.wait();

    res.send(`
      <h2>✅ Product Created</h2>
      <p><b>GPID:</b> ${gpid}</p>
      <p><b>TX:</b> ${tx.hash}</p>
      <p><b>Block:</b> ${receipt.blockNumber}</p>
      <br/>
      <a href="/">Create Another</a>
    `);

  } catch (error) {
    console.error("ERROR:", error);
    res.send(`
      <h2>❌ Error</h2>
      <pre>${error.message}</pre>
      <a href="/">Back</a>
    `);
  }
});

app.listen(PORT, () => {
  console.log("TAAS Panel running on", PORT);
});