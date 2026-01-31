import express from "express";
import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

// =======================
// CONFIG (ENV)
// =======================
const RPC_URL = process.env.RPC_URL;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

// =======================
// PROVIDER (READ ONLY)
// =======================
const provider = new ethers.JsonRpcProvider(RPC_URL);

// =======================
// ABI (ONLY WHAT WE NEED)
// =======================
const ABI = [
  "function getProduct(string) view returns (string,string,string,string,string,string,uint256,address,address,bool)",
  "function claimProduct(string)"
];

const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

// =======================
// HOME
// =======================
app.get("/", (req, res) => {
  res.send(`
    <h2>ASJUJ Product Verifier</h2>
    <form method="GET" action="/verify">
      <input name="gpid" placeholder="ASJUJ-DEMO-0001" />
      <button>Verify</button>
    </form>
  `);
});

// =======================
// VERIFY PRODUCT
// =======================
app.get("/verify", async (req, res) => {
  const gpid = (req.query.gpid || "").trim();
  if (!gpid) return res.send("Invalid GPID");

  try {
    const p = await contract.getProduct(gpid);

    const owner = p[8];
    const stolen = p[9];
    const isUnclaimed = owner === ethers.ZeroAddress;

    res.send(`
      <html>
      <head>
        <title>ASJUJ Verification</title>
        <script src="https://cdn.jsdelivr.net/npm/ethers@6.10.0/dist/ethers.min.js"></script>
      </head>
      <body style="font-family:Arial;padding:30px;background:#0b0f1a;color:#fff">

        <h1>✔ ASJUJ Verified Product</h1>

        <p><b>GPID:</b> ${p[0]}</p>
        <p><b>Brand:</b> ${p[1]}</p>
        <p><b>Model:</b> ${p[2]}</p>
        <p><b>Category:</b> ${p[3]}</p>
        <p><b>Factory:</b> ${p[4]}</p>
        <p><b>Batch:</b> ${p[5]}</p>
        <p><b>Issuer:</b> ${p[7]}</p>
        <p><b>Born:</b> ${new Date(Number(p[6]) * 1000).toUTCString()}</p>

        <hr/>

        <p><b>Status:</b> ${stolen ? "🚨 STOLEN" : "ACTIVE"}</p>
        <p><b>Owner:</b> ${isUnclaimed ? "Unclaimed" : owner}</p>

        ${
          isUnclaimed
            ? `<button onclick="claim()">Claim Product</button>`
            : ""
        }

        <script>
          async function claim() {
            if (!window.ethereum) {
              alert("Wallet not detected");
              return;
            }

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(
              "${CONTRACT_ADDRESS}",
              ["function claimProduct(string)"],
              signer
            );

            try {
              const tx = await contract.claimProduct("${gpid}");
              alert("Transaction sent: " + tx.hash);
            } catch (e) {
              alert("Error: " + e.message);
            }
          }
        </script>

      </body>
      </html>
    `);

  } catch (e) {
    res.send(`
      <h2>❌ Product Not Found</h2>
      <p>This GPID is not registered on ASJUJ Network.</p>
    `);
  }
});

// =======================
app.listen(PORT, () => {
  console.log("TAAS Verifier running on", PORT);
  console.log("Contract:", CONTRACT_ADDRESS);
});