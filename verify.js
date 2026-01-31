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
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

if (!RPC_URL || !CONTRACT_ADDRESS) {
  console.error("❌ Missing ENV variables");
  process.exit(1);
}

// =======================
// PROVIDER
// =======================
const provider = new ethers.JsonRpcProvider(RPC_URL);

// =======================
// CONTRACT ABI (READ ONLY)
// =======================
const ABI = [
  "function getProduct(string) view returns (string,string,string,string,string,string,uint256,address)"
];

const contract = new ethers.Contract(
  CONTRACT_ADDRESS,
  ABI,
  provider
);

// =======================
// HOME PAGE
// =======================
app.get("/", (req, res) => {
  res.send(`
    <h1>ASJUJ Product Verifier</h1>
    <form method="GET" action="/verify">
      <input name="gpid" placeholder="Enter GPID" required />
      <button type="submit">Verify</button>
    </form>
  `);
});

// =======================
// VERIFY PRODUCT
// =======================
app.get("/verify", async (req, res) => {
  try {
    const gpid = req.query.gpid;

    const p = await contract.getProduct(gpid);

    res.send(`
      <h2>✔ ASJUJ Verified Product</h2>
      <p><b>GPID:</b> ${p[0]}</p>
      <p><b>Brand:</b> ${p[1]}</p>
      <p><b>Model:</b> ${p[2]}</p>
      <p><b>Category:</b> ${p[3]}</p>
      <p><b>Factory:</b> ${p[4]}</p>
      <p><b>Batch:</b> ${p[5]}</p>
      <p><b>Issuer:</b> ${p[7]}</p>
      <p><b>Born:</b> ${new Date(Number(p[6]) * 1000).toUTCString()}</p>
      <p style="color:green"><b>Authentic product on ASJUJ Network</b></p>
      <a href="/">Verify Another</a>
    `);
  } catch (err) {
    res.send(`
      <h2>❌ Product Not Found</h2>
      <p>This GPID is not registered on ASJUJ Network.</p>
      <a href="/">Back</a>
    `);
  }
});

// =======================
// START SERVER
// =======================
app.listen(PORT, () => {
  console.log("========== TAAS VERIFIER ==========");
  console.log("Contract:", CONTRACT_ADDRESS);
  console.log("==================================");
  console.log("TAAS Verifier running on", PORT);
});