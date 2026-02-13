const express = require("express");
const { ethers } = require("ethers");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 10000;

const RPC_URL = process.env.RPC_URL;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

const provider = new ethers.JsonRpcProvider(RPC_URL);

const ABI = [
  "function getProduct(string) view returns (string,string,string,string,string,string,uint256,address,address)"
];

const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

app.get("/", (req, res) => {
  res.send(`
  <h2>ASJUJ VERIFIER RUNNING</h2>
  `);
});

app.get("/verify", async (req, res) => {
  try {
    const gpid = req.query.gpid;

    const product = await contract.getProduct(gpid);

    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
    <title>ASJUJ Verification</title>
    <style>

    body {
      margin:0;
      font-family:'Segoe UI',sans-serif;
      background:linear-gradient(135deg,#141e30,#243b55);
      height:100vh;
      display:flex;
      align-items:center;
      justify-content:center;
      color:white;
    }

    .card {
      width:650px;
      padding:50px;
      border-radius:25px;
      background:rgba(255,255,255,0.06);
      backdrop-filter:blur(20px);
      box-shadow:0 0 60px rgba(0,0,0,0.7);
    }

    h2 {
      text-align:center;
      margin-bottom:30px;
      background:linear-gradient(90deg,#00f2fe,#4facfe);
      -webkit-background-clip:text;
      -webkit-text-fill-color:transparent;
    }

    .row {
      margin-bottom:12px;
      padding:10px;
      background:rgba(0,0,0,0.4);
      border-radius:12px;
    }

    </style>
    </head>

    <body>
    <div class="card">
    <h2>ASJUJ VERIFIED PRODUCT</h2>

    <div class="row"><b>GPID:</b> ${product[0]}</div>
    <div class="row"><b>Brand:</b> ${product[1]}</div>
    <div class="row"><b>Model:</b> ${product[2]}</div>
    <div class="row"><b>Category:</b> ${product[3]}</div>
    <div class="row"><b>Factory:</b> ${product[4]}</div>
    <div class="row"><b>Batch:</b> ${product[5]}</div>
    <div class="row"><b>Born:</b> ${new Date(product[6]*1000).toUTCString()}</div>
    <div class="row"><b>Issuer:</b> ${product[7]}</div>
    <div class="row"><b>Owner:</b> ${product[8]}</div>

    </div>
    </body>
    </html>
    `);

  } catch (err) {
    res.send(`
    <h2>❌ Product Not Found</h2>
    <p>This GPID is not registered on ASJUJ Network.</p>
    <a href="/">Try Again</a>
    `);
  }
});

app.listen(PORT, () => {
  console.log("TAAS Verifier running on", PORT);
});
