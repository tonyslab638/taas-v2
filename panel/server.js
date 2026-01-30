const express = require("express");
const { ethers } = require("ethers");
const QRCode = require("qrcode");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== CONFIG FROM ENV =====
const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT;
// ===========================

if (!RPC_URL || !PRIVATE_KEY || !CONTRACT_ADDRESS) {
  console.error("FATAL: Missing environment variables");
  process.exit(1);
}

// ===== CONTRACT ABI (WRITE ONLY) =====
const ABI = [
  "function birthProduct(string,string,string,string,string,string,bytes32)"
];

// ===== BLOCKCHAIN SETUP =====
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

// ===== BOOT LOG =====
(async () => {
  const net = await provider.getNetwork();
  console.log("========== TAAS PANEL V3 ==========");
  console.log("Wallet:", wallet.address);
  console.log("Chain:", net.chainId.toString());
  console.log("Contract:", CONTRACT_ADDRESS);
  console.log("==================================");
})();

// ===== UI: HOME =====
app.get("/", (req, res) => {
  res.send(`
    <html>
      <body style="font-family:Arial;padding:40px">
        <h1>ASJUJ Panel V3</h1>

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

// ===== CREATE PRODUCT + QR =====
app.post("/create", async (req, res) => {
  try {
    const { gpid, brand, model, category, factory, batch } = req.body;

    const tx = await contract.birthProduct(
      gpid,
      brand,
      model,
      category,
      factory,
      batch,
      ethers.id(gpid)
    );

    const receipt = await tx.wait();

    // VERIFICATION URL (QR payload)
    const verifyURL = `https://verify-v2-lowr.onrender.com/verify?gpid=${gpid}`;
    const qr = await QRCode.toDataURL(verifyURL);

    res.send(`
      <html>
        <body style="font-family:Arial;padding:40px">
          <h1>✔ Product Created</h1>

          <p><b>GPID:</b> ${gpid}</p>
          <p><b>Transaction:</b> ${tx.hash}</p>
          <p><b>Block:</b> ${receipt.blockNumber}</p>

          <h2>Scan to Verify</h2>
          <img src="${qr}" />

          <p>
            <a href="${verifyURL}" target="_blank">
              Open Verification Page
            </a>
          </p>

          <hr/>
          <a href="/">Create Another Product</a>
        </body>
      </html>
    `);
  } catch (e) {
    res.send(`
      <h1>❌ Error</h1>
      <pre>${e.message}</pre>
      <a href="/">Back</a>
    `);
  }
});

// ===== START SERVER =====
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("TAAS Panel V3 running on", PORT);
});
