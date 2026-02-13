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

const baseStyle = `
<style>
body {
  margin:0;
  font-family: 'Segoe UI', sans-serif;
  background: linear-gradient(135deg,#0c0c16,#14142b);
  color:white;
}
.container {
  max-width:900px;
  margin:100px auto;
  padding:50px;
  background:rgba(255,255,255,0.05);
  border-radius:20px;
  backdrop-filter: blur(20px);
  box-shadow:0 0 60px rgba(0,0,0,0.6);
}
h1 { font-size:30px; }
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
  background:linear-gradient(90deg,#00c6ff,#0072ff);
  color:white;
  font-weight:bold;
  cursor:pointer;
  transition:0.3s;
}
button:hover {
  transform:scale(1.05);
  box-shadow:0 0 20px #0072ff;
}
.card {
  background:#101024;
  padding:20px;
  border-radius:12px;
  margin-top:20px;
}
.success { border-left:5px solid #00ff99; }
.error { border-left:5px solid red; }
a { color:#00f0ff; text-decoration:none; }
</style>
`;

app.get("/", (req, res) => {
  res.send(`
  <html>
  <head>${baseStyle}</head>
  <body>
    <div class="container">
      <h1>ASJUJ NETWORK — Product Verification</h1>
      <form method="POST" action="/verify">
        <input name="gpid" placeholder="Enter GPID" required />
        <button type="submit">Verify Product</button>
      </form>
    </div>
  </body>
  </html>
  `);
});

app.post("/verify", async (req, res) => {
  try {
    const { gpid } = req.body;
    const p = await contract.getProduct(gpid);

    res.send(`
    <html>
    <head>${baseStyle}</head>
    <body>
      <div class="container">
        <h1>✅ ASJUJ Verified Product</h1>
        <div class="card success">
          <p><strong>GPID:</strong> ${p[0]}</p>
          <p><strong>Brand:</strong> ${p[1]}</p>
          <p><strong>Model:</strong> ${p[2]}</p>
          <p><strong>Category:</strong> ${p[3]}</p>
          <p><strong>Factory:</strong> ${p[4]}</p>
          <p><strong>Batch:</strong> ${p[5]}</p>
          <p><strong>Born:</strong> ${new Date(Number(p[6])*1000).toUTCString()}</p>
          <p><strong>Issuer:</strong> ${p[7]}</p>
          <p><strong>Owner:</strong> ${p[8]}</p>
        </div>
        <br>
        <a href="/">Verify Another</a>
      </div>
    </body>
    </html>
    `);

  } catch {
    res.send(`
    <html>
    <head>${baseStyle}</head>
    <body>
      <div class="container">
        <div class="card error">
          <h2>❌ Product Not Found</h2>
          <p>This GPID is not registered on ASJUJ Network.</p>
        </div>
        <br>
        <a href="/">Try Again</a>
      </div>
    </body>
    </html>
    `);
  }
});

app.listen(PORT, () => {
  console.log("TAAS Verifier running on " + PORT);
});
