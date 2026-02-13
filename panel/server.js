const express = require("express");
const { ethers } = require("ethers");
require("dotenv").config();

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const PORT = process.env.PORT || 10000;

// =======================
// ENV VARIABLES
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
// MINIMAL ABI
// =======================

const ABI = [
  "function birthProduct(string,string,string,string,string,string)"
];

const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

// =======================
// HOME PAGE
// =======================

app.get("/", (req, res) => {
  res.send(`
    <h2>ASJUJ Network - Create Product</h2>
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
// CREATE PRODUCT
// =======================

app.post("/create", async (req, res) => {
  try {
    const { gpid, brand, model, category, factory, batch } = req.body;

    // FORCE LEGACY GAS MODE
    const tx = await contract.birthProduct(
      gpid,
      brand,
      model,
      category,
      factory,
      batch,
      {
        gasLimit: 300000,
        gasPrice: ethers.parseUnits("110", "gwei") // Force above network minimum
      }
    );

    console.log("TX SENT:", tx.hash);

    res.send(`
      <h3>✅ Product Created</h3>
      <p>GPID: ${gpid}</p>
      <p>TX: ${tx.hash}</p>
      <br/>
      <a href="/">Create Another</a>
    `);

  } catch (err) {
    console.error("CREATE ERROR:", err);
    res.send(`
      <h3>❌ Error</h3>
      <p>${err.reason || err.message}</p>
      <br/>
      <a href="/">Back</a>
    `);
  }
});

app.listen(PORT, () => {
  console.log("========== TAAS PANEL ==========");
  console.log("Wallet:", wallet.address);
  console.log("Contract:", CONTRACT_ADDRESS);
  console.log("================================");
  console.log("Panel running on port", PORT);
});