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
    <html>
    <head>
      <title>ASJUJ Network Panel</title>
      <style>
        body {
          font-family: Arial;
          background: #0f172a;
          color: white;
          padding: 40px;
        }
        input {
          padding: 10px;
          margin: 8px 0;
          width: 300px;
        }
        button {
          padding: 12px 20px;
          background: #2563eb;
          color: white;
          border: none;
          cursor: pointer;
        }
        button:hover {
          background: #1e40af;
        }
        .box {
          background: #1e293b;
          padding: 30px;
          border-radius: 8px;
          width: 400px;
        }
      </style>
    </head>
    <body>
      <div class="box">
        <h2>ASJUJ Network - Create Product</h2>
        <form method="POST" action="/create">
          <input name="gpid" placeholder="GPID" required /><br/>
          <input name="brand" placeholder="Brand" required /><br/>
          <input name="model" placeholder="Model" required /><br/>
          <input name="category" placeholder="Category" required /><br/>
          <input name="factory" placeholder="Factory" required /><br/>
          <input name="batch" placeholder="Batch" required /><br/>
          <button type="submit">Create Product</button>
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

    console.log("Sending transaction...");

    const tx = await contract.birthProduct(
      gpid,
      brand,
      model,
      category,
      factory,
      batch,
      {
        gasLimit: 300000,
        gasPrice: ethers.parseUnits("40", "gwei")
      }
    );

    console.log("TX SENT:", tx.hash);

    await tx.wait();

    res.send(`
      <h2 style="color:green;">✅ Product Created</h2>
      <p>GPID: ${gpid}</p>
      <p>Transaction Hash:</p>
      <p>${tx.hash}</p>
      <br/>
      <a href="/" style="color:white;">Create Another</a>
    `);

  } catch (err) {
    console.error("CREATE ERROR:", err);
    res.send(`
      <h2 style="color:red;">❌ Error</h2>
      <p>${err.reason || err.message}</p>
      <br/>
      <a href="/" style="color:white;">Back</a>
    `);
  }
});

app.listen(PORT, () => {
  console.log("========== TAAS PANEL (MUMBAI) ==========");
  console.log("Wallet:", wallet.address);
  console.log("Contract:", CONTRACT_ADDRESS);
  console.log("==========================================");
  console.log("Panel running on port", PORT);
});