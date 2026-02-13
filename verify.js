const express = require("express");
const { ethers } = require("ethers");
require("dotenv").config();

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const PORT = process.env.PORT || 10000;

// =========================
// ENV VARIABLES
// =========================

const RPC_URL = process.env.RPC_URL;              // Sepolia RPC
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

// =========================
// PROVIDER
// =========================

const provider = new ethers.JsonRpcProvider(RPC_URL);

// =========================
// CONTRACT ABI (EXACT MATCH)
// =========================

const ABI = [
  "function getProduct(string memory gpid) view returns (string,string,string,string,string,string,uint256,address,address)"
];

const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

// =========================
// UI
// =========================

app.get("/", (req, res) => {
  res.send(`
    <html>
    <head>
      <title>ASJUJ Network – Verify Product</title>
      <style>
        body {
          background: #0f172a;
          color: white;
          font-family: Arial;
          text-align: center;
          padding-top: 100px;
        }
        input {
          padding: 12px;
          width: 300px;
          border-radius: 6px;
          border: none;
        }
        button {
          padding: 12px 20px;
          background: #2563eb;
          border: none;
          color: white;
          border-radius: 6px;
          cursor: pointer;
        }
        .box {
          margin-top: 40px;
        }
      </style>
    </head>
    <body>
      <h1>ASJUJ Network</h1>
      <h3>Verify Product Digital Identity</h3>

      <form action="/verify" method="POST">
        <input type="text" name="gpid" placeholder="Enter GPID" required />
        <br/><br/>
        <button type="submit">Verify Product</button>
      </form>
    </body>
    </html>
  `);
});

// =========================
// VERIFY ROUTE
// =========================

app.post("/verify", async (req, res) => {
  try {
    const { gpid } = req.body;

    const product = await contract.getProduct(gpid);

    res.send(`
      <html>
      <body style="background:#0f172a;color:white;font-family:Arial;text-align:center;padding-top:80px;">
        <h2>✅ ASJUJ Verified Product</h2>

        <p><b>GPID:</b> ${product[0]}</p>
        <p><b>Brand:</b> ${product[1]}</p>
        <p><b>Model:</b> ${product[2]}</p>
        <p><b>Category:</b> ${product[3]}</p>
        <p><b>Factory:</b> ${product[4]}</p>
        <p><b>Batch:</b> ${product[5]}</p>
        <p><b>Born:</b> ${new Date(Number(product[6]) * 1000).toUTCString()}</p>
        <p><b>Issuer:</b> ${product[7]}</p>
        <p><b>Owner:</b> ${product[8]}</p>

        <br/>
        <a href="/" style="color:#60a5fa;">Verify Another</a>
      </body>
      </html>
    `);

  } catch (err) {
    res.send(`
      <html>
      <body style="background:#0f172a;color:white;font-family:Arial;text-align:center;padding-top:100px;">
        <h2>❌ Product Not Found</h2>
        <p>This GPID is not registered on ASJUJ Network.</p>
        <br/>
        <a href="/" style="color:#60a5fa;">Try Again</a>
      </body>
      </html>
    `);
  }
});

// =========================

app.listen(PORT, () => {
  console.log("=================================");
  console.log("ASJUJ Verifier Running");
  console.log("Network: Sepolia");
  console.log("Contract:", CONTRACT_ADDRESS);
  console.log("=================================");
});