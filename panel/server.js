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
// CONTRACT
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
// UI : HOME
// =======================
app.get("/", async (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>ASJUJ Network — Panel</title>
  <style>
    body {
      background:#0b0f14;
      color:#eaeaea;
      font-family: Arial, sans-serif;
      padding:40px;
    }
    h1 { color:#00f6ff; }
    .box {
      background:#121821;
      padding:20px;
      border-radius:12px;
      max-width:520px;
    }
    input, button {
      width:100%;
      padding:10px;
      margin:6px 0;
      border-radius:6px;
      border:none;
    }
    input { background:#1c2330; color:#fff; }
    button {
      background:#00f6ff;
      color:#000;
      font-weight:bold;
      cursor:pointer;
    }
    .meta {
      font-size:13px;
      color:#9aa4b2;
      margin-bottom:12px;
    }
  </style>
</head>
<body>

<h1>ASJUJ Network</h1>
<div class="meta">
Wallet: ${wallet.address}<br>
Contract: ${CONTRACT_ADDRESS}<br>
Network: Polygon Amoy
</div>

<div class="box">
  <h3>Create Product</h3>
  <form method="POST" action="/create">
    <input name="gpid" placeholder="GPID (e.g. ASJUJ-DEMO-0002)" required />
    <input name="brand" placeholder="Brand" required />
    <input name="model" placeholder="Model" required />
    <input name="category" placeholder="Category" required />
    <input name="factory" placeholder="Factory" required />
    <input name="batch" placeholder="Batch" required />
    <button type="submit">CREATE PRODUCT</button>
  </form>
</div>

</body>
</html>
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

    res.send(`
      <h2>✅ Product Created</h2>
      <p><b>GPID:</b> ${gpid}</p>
      <p><b>TX:</b> ${tx.hash}</p>
      <p><a href="/">Create Another</a></p>
      <p><a href="${process.env.VERIFIER_URL || "#"}?gpid=${gpid}">Verify Product</a></p>
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
// START
// =======================
app.listen(PORT, () => {
  console.log("========== TAAS PANEL ==========");
  console.log("Wallet:", wallet.address);
  console.log("Contract:", CONTRACT_ADDRESS);
  console.log("TAAS Panel running on", PORT);
});