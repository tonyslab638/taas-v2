const express = require("express");
const { ethers } = require("ethers");

const app = express();
app.use(express.json());

// ===== CONFIG =====
const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT;
// ==================

const ABI = [
  "function birthProduct(string,string,string,string,string,string,bytes32)"
];

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

(async () => {
  const net = await provider.getNetwork();
  console.log("PANEL BOOT");
  console.log("Wallet:", wallet.address);
  console.log("Chain:", net.chainId.toString());
  console.log("Contract:", CONTRACT_ADDRESS);
})();

// UI
app.get("/", (req, res) => {
  res.send(`
    <html>
      <body style="font-family:Arial;padding:40px">
        <h1>TAAS Panel V2</h1>
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

app.use(express.urlencoded({ extended: true }));

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

    const r = await tx.wait();

    res.send(`
      <h2>Product Created</h2>
      <p>TX: ${tx.hash}</p>
      <p>Block: ${r.blockNumber}</p>
      <a href="/">Create Another</a>
    `);
  } catch (e) {
    res.send(`
      <h2>Error</h2>
      <pre>${e.message}</pre>
      <a href="/">Back</a>
    `);
  }
});

app.listen(10000, () => {
  console.log("TAAS Panel running on 10000");
});
