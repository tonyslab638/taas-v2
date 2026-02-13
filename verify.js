const express = require("express");
const { ethers } = require("ethers");
require("dotenv").config();

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const PORT = process.env.PORT || 10000;

const RPC_URL = process.env.RPC_URL;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

const provider = new ethers.JsonRpcProvider(RPC_URL);

const ABI = [
  "function getProduct(string) view returns (string,string,string,string,string,string,uint256,address,address)"
];

const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

// ===========================
// HOME PAGE
// ===========================

app.get("/", (req, res) => {
  res.send(`
    <html>
      <body style="font-family: Arial; padding:40px;">
        <h2>ASJUJ Network — Product Verification</h2>
        <form action="/verify" method="POST">
          <input name="gpid" placeholder="Enter GPID" required />
          <button type="submit">Verify</button>
        </form>
      </body>
    </html>
  `);
});

// ===========================
// VERIFY ROUTE
// ===========================

app.post("/verify", async (req, res) => {
  try {
    const { gpid } = req.body;

    if (!gpid) {
      return res.send("❌ GPID missing");
    }

    const product = await contract.getProduct(gpid);

    res.send(`
      <html>
        <body style="font-family: Arial; padding:40px;">
          <h2>✅ ASJUJ Verified Product</h2>
          <p><strong>GPID:</strong> ${product[0]}</p>
          <p><strong>Brand:</strong> ${product[1]}</p>
          <p><strong>Model:</strong> ${product[2]}</p>
          <p><strong>Category:</strong> ${product[3]}</p>
          <p><strong>Factory:</strong> ${product[4]}</p>
          <p><strong>Batch:</strong> ${product[5]}</p>
          <p><strong>Born:</strong> ${new Date(Number(product[6]) * 1000).toUTCString()}</p>
          <p><strong>Issuer:</strong> ${product[7]}</p>
          <p><strong>Owner:</strong> ${product[8]}</p>
          <br>
          <a href="/">Verify Another</a>
        </body>
      </html>
    `);

  } catch (error) {
    res.send(`
      <html>
        <body style="font-family: Arial; padding:40px;">
          <h2>❌ Product Not Found</h2>
          <p>This GPID is not registered on ASJUJ Network.</p>
          <br>
          <a href="/">Try Again</a>
        </body>
      </html>
    `);
  }
});

app.listen(PORT, () => {
  console.log("TAAS Verifier running on " + PORT);
});
