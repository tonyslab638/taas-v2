import express from "express";
import { ethers } from "ethers";

const app = express();
const PORT = process.env.PORT || 10000;

// ===== ENV =====
const RPC_URL = process.env.RPC_URL;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

// ===== ABI (INLINE, SAFE) =====
const ABI = [
  {
    "inputs": [{ "internalType": "string", "name": "gpid", "type": "string" }],
    "name": "getProduct",
    "outputs": [
      { "internalType": "string", "type": "string" },
      { "internalType": "string", "type": "string" },
      { "internalType": "string", "type": "string" },
      { "internalType": "string", "type": "string" },
      { "internalType": "string", "type": "string" },
      { "internalType": "string", "type": "string" },
      { "internalType": "uint256", "type": "uint256" },
      { "internalType": "address", "type": "address" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// ===== BLOCKCHAIN =====
const provider = new ethers.JsonRpcProvider(RPC_URL);
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

// ===== HOME =====
app.get("/", (req, res) => {
  res.send(`
    <h2>ASJUJ Verifier V3</h2>
    <form method="GET" action="/verify">
      <input name="gpid" placeholder="ASJUJ-V3-FINAL-0001" />
      <button>Verify</button>
    </form>
  `);
});

// ===== VERIFY =====
app.get("/verify", async (req, res) => {
  const gpid = (req.query.gpid || "").trim();

  if (!gpid) {
    return res.send("❌ Invalid GPID");
  }

  try {
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

    res.send(`
      <h1>✔ ASJUJ Verified Product</h1>
      <p><b>GPID:</b> ${_gpid}</p>
      <p><b>Brand:</b> ${brand}</p>
      <p><b>Model:</b> ${model}</p>
      <p><b>Category:</b> ${category}</p>
      <p><b>Factory:</b> ${factory}</p>
      <p><b>Batch:</b> ${batch}</p>
      <p><b>Issuer:</b> ${issuer}</p>
      <p><b>Born:</b> ${new Date(Number(bornAt) * 1000).toUTCString()}</p>
      <hr />
      <p style="color:green">Authentic product on ASJUJ Network</p>
    `);

  } catch (err) {
    res.send(`
      <h1>❌ Product Not Found</h1>
      <p>This GPID is not registered on ASJUJ Network.</p>
    `);
  }
});

app.listen(PORT, () => {
  console.log("TAAS Verifier V3 running on", PORT);
  console.log("RPC:", RPC_URL);
  console.log("Contract:", CONTRACT_ADDRESS);
});
