const express = require("express");
const { ethers } = require("ethers");
require("dotenv").config();

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

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
// V3 CONTRACT ABI (ONLY WHAT WE NEED)
// =======================
const ABI = [
  "function birthProduct(string,string,string,string,string,string)"
];

const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

// =======================
// UI (Simple Form)
// =======================
app.get("/", (req, res) => {
  res.send(`
    <h2>ASJUJ TAAS – Panel V3</h2>
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

// =======================
// CREATE PRODUCT (V3)
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
      <p><b>Transaction:</b> ${tx.hash}</p>
      <p><b>Block:</b> ${receipt.blockNumber}</p>
      <br/>
      <a href="https://taas-verifier-v3.onrender.com/verify?gpid=${gpid}">
        Verify Product
      </a>
      <br/><br/>
      <a href="/">Create Another</a>
    `);
  } catch (err) {
    res.send(`
      <h2>❌ Error</h2>
      <pre>${err.message}</pre>
      <br/>
      <a href="/">Back</a>
    `);
  }
});

// =======================
// START SERVER
// =======================
app.listen(PORT, () => {
  console.log("TAAS Panel V3 running on", PORT);
  console.log("Wallet:", wallet.address);
  console.log("Chain: 80002");
  console.log("Contract:", CONTRACT_ADDRESS);
});
