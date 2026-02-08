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

// =======================
// PROVIDER / WALLET
// =======================
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// =======================
// CONTRACT
// =======================
const ABI = [
  "function birthProduct(string,string,string,string,string,string)"
];

const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

// =======================
// UI (UNCHANGED)
// =======================
app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>ASJUJ Network – Panel</title>
  <style>
    body { background:#0b0b0b; color:#fff; font-family:Arial; padding:40px; }
    h1 { color:#00ffd5; }
    input, button { width:100%; padding:12px; margin:8px 0; font-size:16px; }
    button { background:#00ffd5; border:none; font-weight:bold; cursor:pointer; }
    .box { max-width:500px; margin:auto; background:#111; padding:25px; border-radius:8px; }
  </style>
</head>
<body>
  <div class="box">
    <h1>ASJUJ Product Creation</h1>
    <form method="POST" action="/create">
      <input name="gpid" placeholder="GPID (ASJUJ-XXXX-0001)" required />
      <input name="brand" placeholder="Brand" required />
      <input name="model" placeholder="Model" required />
      <input name="category" placeholder="Category" />
      <input name="factory" placeholder="Factory" />
      <input name="batch" placeholder="Batch" />
      <button type="submit">CREATE PRODUCT</button>
    </form>
  </div>
</body>
</html>
  `);
});

// =======================
// CREATE PRODUCT (UPGRADED)
// =======================
app.post("/create", async (req, res) => {
  try {
    const { gpid, brand, model, category, factory, batch } = req.body;

    const tx = await contract.birthProduct(
      gpid,
      brand,
      model,
      category || "",
      factory || "",
      batch || "",
      { gasLimit: 180000 }
    );

    // 🚫 DO NOT WAIT FOR tx.wait()

    res.send(`
      <h2>✅ Product Submitted</h2>
      <p><b>GPID:</b> ${gpid}</p>
      <p><b>TX:</b> ${tx.hash}</p>
      <p>Status: ⏳ Pending confirmation</p>
      <br/>
      <a href="/">Create Another</a>
      <br/><br/>
      <a href="https://taas-verifier-v3.onrender.com/?gpid=${gpid}" target="_blank">
        Verify Product
      </a>
    `);

  } catch (err) {
    res.send(`<h3>❌ Error</h3><pre>${err.message}</pre><a href="/">Back</a>`);
  }
});

// =======================
// START SERVER
// =======================
app.listen(PORT, () => {
  console.log("========== TAAS PANEL ==========");
  console.log("Wallet:", wallet.address);
  console.log("Contract:", CONTRACT_ADDRESS);
  console.log("TAAS Panel running on", PORT);
  console.log("================================");
});