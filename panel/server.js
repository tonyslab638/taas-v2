const express = require("express");
const { ethers } = require("ethers");
require("dotenv").config();

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const PORT = process.env.PORT || 10000;

// ================= ENV =================
const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

// ============== PROVIDER ==============
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// ============== CONTRACT ABI ==========
const ABI = [
  "function createProduct(string,string,string,string,string,string)"
];

const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

// ================= UI =================
app.get("/", (req, res) => {
  res.send(`
  <!DOCTYPE html>
  <html>
  <head>
  <title>ASJUJ Network</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>

  body {
    margin:0;
    font-family: 'Segoe UI', sans-serif;
    background: linear-gradient(135deg,#0f2027,#203a43,#2c5364);
    height:100vh;
    display:flex;
    align-items:center;
    justify-content:center;
    color:white;
  }

  .card {
    width:600px;
    padding:50px;
    border-radius:25px;
    background: rgba(255,255,255,0.06);
    backdrop-filter: blur(20px);
    box-shadow: 0 0 50px rgba(0,0,0,0.6);
  }

  h1 {
    text-align:center;
    margin-bottom:40px;
    font-weight:600;
    letter-spacing:2px;
    background: linear-gradient(90deg,#00f2fe,#4facfe);
    -webkit-background-clip:text;
    -webkit-text-fill-color:transparent;
  }

  input {
    width:100%;
    padding:14px;
    margin-bottom:15px;
    border-radius:12px;
    border:none;
    background:rgba(0,0,0,0.4);
    color:white;
  }

  input:focus {
    outline:none;
    box-shadow:0 0 10px #4facfe;
  }

  button {
    width:100%;
    padding:15px;
    border-radius:14px;
    border:none;
    font-weight:bold;
    background: linear-gradient(90deg,#00f2fe,#4facfe);
    cursor:pointer;
    transition:0.3s;
  }

  button:hover {
    transform:scale(1.05);
    box-shadow:0 0 20px #4facfe;
  }

  </style>
  </head>

  <body>
  <div class="card">
  <h1>ASJUJ NETWORK</h1>

  <form method="POST" action="/create">
    <input name="gpid" placeholder="GPID" required />
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

// ================= CREATE PRODUCT =================
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

    await tx.wait();

    res.send(`
    <h2 style="color:green;">✅ Product Created</h2>
    <p><b>GPID:</b> ${gpid}</p>
    <p><b>TX:</b> ${tx.hash}</p>
    <br>
    <a href="/">Create Another</a>
    <br>
    <a href="https://taas-verifier-v3.onrender.com/verify?gpid=${gpid}">
    Verify Product</a>
    `);

  } catch (err) {
    res.send(`<h2>❌ Error</h2><pre>${err.message}</pre>`);
  }
});

app.listen(PORT, () => {
  console.log("TAAS PANEL running on", PORT);
});
