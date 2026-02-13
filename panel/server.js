const express = require("express");
const { ethers } = require("ethers");
require("dotenv").config();

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const PORT = process.env.PORT || 10000;

const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

const ABI = [
  "function createProduct(string,string,string,string,string,string)"
];

const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

const baseStyle = `
<style>
body {
  margin:0;
  font-family: 'Segoe UI', sans-serif;
  background: linear-gradient(135deg, #0f0f1a, #1c1c2e);
  color: white;
}
.container {
  max-width: 900px;
  margin: 80px auto;
  padding: 50px;
  background: rgba(255,255,255,0.05);
  border-radius: 20px;
  backdrop-filter: blur(20px);
  box-shadow: 0 0 60px rgba(0,0,0,0.6);
}
h1 {
  font-size: 32px;
  letter-spacing: 2px;
}
input {
  width:100%;
  padding:14px;
  margin:10px 0;
  border:none;
  border-radius:10px;
  background:#1e1e30;
  color:white;
}
button {
  padding:14px 25px;
  border:none;
  border-radius:12px;
  background: linear-gradient(90deg,#6a11cb,#2575fc);
  color:white;
  font-weight:bold;
  cursor:pointer;
  transition:0.3s;
}
button:hover {
  transform: scale(1.05);
  box-shadow:0 0 20px #6a11cb;
}
.success {
  background:#0d2d1f;
  padding:20px;
  border-radius:12px;
}
.error {
  background:#3a0d0d;
  padding:20px;
  border-radius:12px;
}
a {
  color:#00f0ff;
  text-decoration:none;
}
</style>
`;

app.get("/", (req, res) => {
  res.send(`
  <html>
  <head>${baseStyle}</head>
  <body>
    <div class="container">
      <h1>ASJUJ NETWORK — Product Issuance Console</h1>
      <p>Enterprise Product Identity Infrastructure</p>
      <form method="POST" action="/create">
        <input name="gpid" placeholder="GPID (Unique Product ID)" required />
        <input name="brand" placeholder="Brand" required />
        <input name="model" placeholder="Model" required />
        <input name="category" placeholder="Category" required />
        <input name="factory" placeholder="Factory" required />
        <input name="batch" placeholder="Batch" required />
        <button type="submit">Create Product</button>
      </form>
    </div>
  </body>
  </html>
  `);
});

app.post("/create", async (req, res) => {
  try {
    const { gpid, brand, model, category, factory, batch } = req.body;

    const tx = await contract.createProduct(
      gpid,
      brand,
      model,
      category,
      factory,
      batch
    );

    await tx.wait();

    res.send(`
    <html>
    <head>${baseStyle}</head>
    <body>
      <div class="container success">
        <h2>✅ Product Created</h2>
        <p><strong>GPID:</strong> ${gpid}</p>
        <p><strong>TX:</strong> ${tx.hash}</p>
        <br>
        <a href="/">Create Another</a>
      </div>
    </body>
    </html>
    `);

  } catch (err) {
    res.send(`
    <html>
    <head>${baseStyle}</head>
    <body>
      <div class="container error">
        <h2>❌ Error</h2>
        <p>${err.message}</p>
        <br>
        <a href="/">Back</a>
      </div>
    </body>
    </html>
    `);
  }
});

app.listen(PORT, () => {
  console.log("TAAS PANEL running on " + PORT);
});
