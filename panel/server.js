// ===============================
// ASJUJ / TAAS — PANEL (CLEAN)
// ===============================

const express = require("express");
const { ethers } = require("ethers");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 10000;

// ===============================
// ENV VALIDATION (CRITICAL)
// ===============================
const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

if (!RPC_URL || !PRIVATE_KEY || !CONTRACT_ADDRESS) {
  console.error("❌ FATAL: Missing environment variables");
  console.error({
    RPC_URL: !!RPC_URL,
    PRIVATE_KEY: !!PRIVATE_KEY,
    CONTRACT_ADDRESS: !!CONTRACT_ADDRESS,
  });
  process.exit(1);
}

// ===============================
// PROVIDER + WALLET
// ===============================
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// ===============================
// CONTRACT (V3 FINAL ABI ONLY)
// ===============================
const ABI = [
  "function birthProduct(string,string,string,string,string,string)",
];

const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

// ===============================
// BOOT LOG
// ===============================
(async () => {
  const net = await provider.getNetwork();
  console.log("========== TAAS PANEL (CLEAN) ==========");
  console.log("Wallet:", wallet.address);
  console.log("Chain:", Number(net.chainId));
  console.log("Contract:", CONTRACT_ADDRESS);
  console.log("=======================================");
})();

// ===============================
// UI (SIMPLE FORM)
// ===============================
app.get("/", (req, res) => {
  res.send(`
    <html>
      <body style="font-family:Arial;padding:40px">
        <h2>ASJUJ — Create Product</h2>
        <form method="POST" action="/create">
          <input name="gpid" placeholder="GPID" required /><br/><br/>
          <input name="brand" placeholder="Brand" required /><br/><br/>
          <input name="model" placeholder="Model" required /><br/><br/>
          <input name="category" placeholder="Category" required /><br/><br/>
          <input name="factory" placeholder="Factory" required /><br/><br/>
          <input name="batch" placeholder="Batch" required /><br/><br/>
          <button>Create Product</button>
        </form>
      </body>
    </html>
  `);
});

// ===============================
// CREATE PRODUCT
// ===============================
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
      <p><b>TX:</b> ${tx.hash}</p>
      <p><b>Block:</b> ${receipt.blockNumber}</p>
      <br/>
      <a href="/">Create Another</a>
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

// ===============================
// START SERVER
// ===============================
app.listen(PORT, () => {
  console.log(`TAAS Panel running on ${PORT}`);
});