import express from "express";
import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// =======================
// ENV CONFIG
// =======================
const RPC_URL = process.env.RPC_URL;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

if (!RPC_URL || !CONTRACT_ADDRESS) {
  console.error("❌ Missing RPC_URL or CONTRACT_ADDRESS");
  process.exit(1);
}

// =======================
// BLOCKCHAIN SETUP
// =======================
const provider = new ethers.JsonRpcProvider(RPC_URL);

const ABI = [
  "function getProduct(string) view returns (string,string,string,string,string,string,uint256,address)",
  "function productExists(string) view returns (bool)",
  "function stolen(string) view returns (bool)",
  "function owner(string) view returns (address)"
];

const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

// =======================
// HOME PAGE
// =======================
app.get("/", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>ASJUJ Verifier</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <style>
          body {
            background:#0b0f1a;
            color:#e5e7eb;
            font-family:system-ui;
            display:flex;
            justify-content:center;
            align-items:center;
            height:100vh;
          }
          .box {
            background:#111827;
            padding:30px;
            border-radius:16px;
            width:100%;
            max-width:360px;
            text-align:center;
          }
          input {
            width:100%;
            padding:12px;
            border-radius:10px;
            border:none;
            margin-top:12px;
          }
          button {
            margin-top:16px;
            width:100%;
            padding:12px;
            border-radius:10px;
            border:none;
            background:#2563eb;
            color:white;
            font-weight:600;
          }
        </style>
      </head>
      <body>
        <div class="box">
          <h2>ASJUJ TRUST VERIFIER</h2>
          <p>Verify any product instantly</p>
          <form method="GET" action="/verify">
            <input name="gpid" placeholder="ASJUJ-DEMO-0001" required />
            <button>Verify Product</button>
          </form>
        </div>
      </body>
    </html>
  `);
});

// =======================
// VERIFY ROUTE
// =======================
app.get("/verify", async (req, res) => {
  const gpid = (req.query.gpid || "").trim();

  if (!gpid) {
    return res.redirect("/");
  }

  try {
    const exists = await contract.productExists(gpid);
    if (!exists) throw new Error("NOT_FOUND");

    const [
      _gpid,
      brand,
      model,
      category,
      factory,
      batch,
      bornAt,
      issuer
    ] = await contract.getProduct(gpid);

    const stolen = await contract.stolen(gpid);
    const owner = await contract.owner(gpid);

    res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>ASJUJ Verified</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    body {
      margin:0;
      font-family:system-ui;
      background:#0b0f1a;
      color:#e5e7eb;
      display:flex;
      justify-content:center;
      align-items:center;
      min-height:100vh;
    }
    .card {
      background:#111827;
      border-radius:18px;
      padding:26px;
      width:100%;
      max-width:420px;
      box-shadow:0 20px 40px rgba(0,0,0,.6);
    }
    .title {
      text-align:center;
      margin-bottom:20px;
    }
    .status {
      padding:14px;
      border-radius:12px;
      text-align:center;
      font-weight:700;
      margin-bottom:20px;
      background:${stolen ? "#3b0b0b" : "#0b3b1d"};
      color:${stolen ? "#ff4c4c" : "#4cff4c"};
    }
    .row {
      margin:10px 0;
    }
    .label {
      font-size:12px;
      color:#9ca3af;
    }
    .value {
      word-break:break-all;
    }
    .footer {
      margin-top:20px;
      font-size:12px;
      text-align:center;
      color:#6b7280;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="title">
      <h2>ASJUJ VERIFIED</h2>
      <p>Global Product Trust</p>
    </div>

    <div class="status">
      ${stolen ? "🚨 PRODUCT REPORTED STOLEN" : "✔ AUTHENTIC PRODUCT"}
    </div>

    <div class="row"><div class="label">GPID</div><div class="value">${_gpid}</div></div>
    <div class="row"><div class="label">Brand</div><div class="value">${brand}</div></div>
    <div class="row"><div class="label">Model</div><div class="value">${model}</div></div>
    <div class="row"><div class="label">Category</div><div class="value">${category}</div></div>
    <div class="row"><div class="label">Factory</div><div class="value">${factory}</div></div>
    <div class="row"><div class="label">Batch</div><div class="value">${batch}</div></div>
    <div class="row"><div class="label">Issuer</div><div class="value">${issuer}</div></div>
    <div class="row"><div class="label">Owner</div><div class="value">${owner}</div></div>
    <div class="row"><div class="label">Born</div><div class="value">${new Date(Number(bornAt)*1000).toUTCString()}</div></div>

    <div class="footer">
      Status: ${stolen ? "DO NOT TRUST" : "SAFE & AUTHENTIC"}<br/>
      Powered by ASJUJ Network
    </div>
  </div>
</body>
</html>
    `);
  } catch (e) {
    res.send(`
      <html>
        <body style="background:#1a0b0b;color:white;font-family:system-ui;text-align:center;padding:40px">
          <h2>❌ Product Not Found</h2>
          <p>This GPID is not registered on ASJUJ Network.</p>
          <a href="/" style="color:#4cff4c">Try Again</a>
        </body>
      </html>
    `);
  }
});

// =======================
app.listen(PORT, () => {
  console.log("TAAS Verifier running on", PORT);
});