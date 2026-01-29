const express = require("express");
const { ethers } = require("ethers");

// ===== CONFIG FROM ENV =====
const RPC_URL = process.env.RPC_URL;
const CONTRACT_ADDRESS = process.env.CONTRACT;
// ===========================

if (!RPC_URL || !CONTRACT_ADDRESS) {
  console.error("FATAL: Missing RPC_URL or CONTRACT in environment variables");
  process.exit(1);
}

// ABI for V2 contract read-layer
const ABI = [
  "function exists(string gpid) view returns (bool)",
  "function getCore(string gpid) view returns (string,string,string,string,string,string)",
  "function getMeta(string gpid) view returns (uint256,address,bytes32)"
];

const provider = new ethers.JsonRpcProvider(RPC_URL);
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

const app = express();
const PORT = process.env.PORT || 10000;

// Boot log
(async () => {
  const net = await provider.getNetwork();
  console.log("========== TAAS VERIFY V2 ==========");
  console.log("RPC:", RPC_URL);
  console.log("Chain:", net.chainId.toString());
  console.log("Contract:", CONTRACT_ADDRESS);
  console.log("===================================");
})();

// Home
app.get("/", (req, res) => {
  res.send(`
    <html>
      <body style="font-family:Arial;padding:40px;background:#0b0f1a;color:#fff">
        <h1>ASJUJ Verify V2</h1>
        <form method="GET" action="/verify">
          <input name="gpid" placeholder="ASJUJ-V2-0001" style="padding:10px;font-size:16px"/>
          <button style="padding:10px 16px;font-size:16px">Verify</button>
        </form>
      </body>
    </html>
  `);
});

// Verify endpoint
app.get("/verify", async (req, res) => {
  const gpid = (req.query.gpid || "").trim();

  if (!gpid) {
    return res.send("<h2>Invalid GPID</h2>");
  }

  try {
    const ok = await contract.exists(gpid);
    if (!ok) {
      return res.send(`
        <h1>❌ Product Not Found</h1>
        <p>This GPID is not registered on ASJUJ Network.</p>
      `);
    }

    const core = await contract.getCore(gpid);
    const meta = await contract.getMeta(gpid);

    res.send(`
      <html>
        <body style="font-family:Arial;padding:40px;background:#0b0f1a;color:#fff">
          <h1>✔ ASJUJ Verified Product</h1>
          <p><b>GPID:</b> ${core[0]}</p>
          <p><b>Brand:</b> ${core[1]}</p>
          <p><b>Model:</b> ${core[2]}</p>
          <p><b>Category:</b> ${core[3]}</p>
          <p><b>Factory:</b> ${core[4]}</p>
          <p><b>Batch:</b> ${core[5]}</p>
          <p><b>Issuer:</b> ${meta[1]}</p>
          <p><b>Born:</b> ${new Date(Number(meta[0]) * 1000).toUTCString()}</p>
          <hr/>
          <p style="color:#4cff4c">Authentic product on ASJUJ Network</p>
        </body>
      </html>
    `);
  } catch (e) {
    res.send(`
      <h1>❌ Verifier Error</h1>
      <pre>${e.message}</pre>
    `);
  }
});

app.listen(PORT, () => {
  console.log("Verifier V2 running on", PORT);
});
