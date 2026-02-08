// ========================================
// ASJUJ NETWORK — TAAS PANEL (AMOY SAFE)
// ========================================

const express = require("express");
const { ethers } = require("ethers");
require("dotenv").config();

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const PORT = process.env.PORT || 10000;

// ========================================
// ENV CHECK (FAIL FAST)
// ========================================
const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

if (!RPC_URL || !PRIVATE_KEY || !CONTRACT_ADDRESS) {
  console.error("❌ Missing ENV variables");
  process.exit(1);
}

// ========================================
// PROVIDER + WALLET
// ========================================
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// ========================================
// CONTRACT ABI (WRITE ONLY)
// ========================================
const ABI = [
  "function birthProduct(string,string,string,string,string,string)"
];

const contract = new ethers.Contract(
  CONTRACT_ADDRESS,
  ABI,
  wallet
);

// ========================================
// UI — HOME
// ========================================
app.get("/", (req, res) => {
  res.send(`
  <html>
    <head>
      <title>ASJUJ Network — Panel</title>
      <style>
        body {
          margin:0;
          background:#0b0f1a;
          color:#fff;
          font-family:Arial, sans-serif;
          display:flex;
          justify-content:center;
          align-items:center;
          height:100vh;
        }
        .box {
          background:#12172f;
          padding:30px;
          width:420px;
          border-radius:12px;
          box-shadow:0 0 40px rgba(0,0,0,0.7);
        }
        h1 { margin:0 0 5px 0; }
        p { margin:0 0 15px 0; color:#aaa; }
        input, button {
          width:100%;
          padding:10px;
          margin-top:8px;
          border-radius:6px;
          border:none;
          font-size:14px;
        }
        input {
          background:#1c2245;
          color:#fff;
        }
        button {
          background:#5b7cff;
          color:#fff;
          font-weight:bold;
          cursor:pointer;
        }
        button:hover {
          background:#6f8cff;
        }
      </style>
    </head>
    <body>
      <div class="box">
        <h1>ASJUJ Network</h1>
        <p>Product Issuance Panel</p>
        <form method="POST" action="/create">
          <input name="gpid" placeholder="GPID" required />
          <input name="brand" placeholder="Brand" required />
          <input name="model" placeholder="Model" required />
          <input name="category" placeholder="Category" required />
          <input name="factory" placeholder="Factory" required />
          <input name="batch" placeholder="Batch" required />
          <button type="submit">Create Product</button>
        </form>
      </div>
    </body>
  </html>
  `);
});

// ========================================
// CREATE PRODUCT (AMOY GAS FIXED)
// ========================================
app.post("/create", async (req, res) => {
  const { gpid, brand, model, category, factory, batch } = req.body;

  try {
    const tx = await contract.birthProduct(
      gpid,
      brand,
      model,
      category,
      factory,
      batch,
      {
        gasLimit: 400000,
        maxFeePerGas: ethers.parseUnits("100", "gwei"),
        maxPriorityFeePerGas: ethers.parseUnits("30", "gwei")
      }
    );

    res.send(`
      <h2>✅ Product Created</h2>
      <p><b>GPID:</b> ${gpid}</p>
      <p><b>TX:</b> ${tx.hash}</p>
      <br/>
      <a href="/">Create Another</a><br/>
      <a href="https://taas-verifier-v3.onrender.com/?gpid=${gpid}">
        Verify Product
      </a>
    `);

  } catch (err) {
    console.error(err);
    res.send(`
      <h2>❌ Error</h2>
      <pre>${err.reason || err.message}</pre>
      <a href="/">Back</a>
    `);
  }
});

// ========================================
// BOOT
// ========================================
app.listen(PORT, () => {
  console.log("========== TAAS PANEL ==========");
  console.log("Wallet:", wallet.address);
  console.log("Contract:", CONTRACT_ADDRESS);
  console.log("================================");
  console.log("TAAS Panel running on", PORT);
});