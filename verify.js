import express from "express";
import { ethers } from "ethers";

const app = express();
const PORT = process.env.PORT || 10000;

// =======================
// ENV
// =======================
const RPC_URL = process.env.RPC_URL;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

// =======================
// PROVIDER
// =======================
const provider = new ethers.JsonRpcProvider(RPC_URL);

// =======================
// ABI (READ + OWNERSHIP + STOLEN)
// =======================
const ABI = [
  "function getProduct(string) view returns (string,string,string,string,string,string,uint256,address,address,bool)",
  "function transferOwnership(string,address)",
  "function markStolen(string)",
  "function recoverProduct(string)"
];

const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

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
app.get("/verify", async (req, res) => {
  const gpid = (req.query.gpid || "").trim();
  if (!gpid) return res.send("Invalid GPID");

  try {
    const p = await contract.getProduct(gpid);

    const owner = p[8];
    const stolen = p[9];

    res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>ASJUJ Verification</title>
  <script src="https://cdn.jsdelivr.net/npm/ethers@6.10.0/dist/ethers.min.js"></script>
</head>
<body style="font-family:Arial;background:#0b0f1a;color:white;padding:30px">

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

<h2>Status: ${stolen ? "🚨 STOLEN" : "ACTIVE"}</h2>
<p><b>Owner:</b> ${owner}</p>

<div id="ownerActions" style="display:none;margin-top:30px">
  <h3>Owner Actions</h3>

  <div id="activeActions" style="display:none">
    <input id="newOwner" placeholder="0xBuyerAddress" style="width:420px" />
    <br/><br/>
    <button onclick="transfer()">Transfer Ownership</button>
    <br/><br/>
    <button onclick="markStolen()">🚨 Mark as Stolen</button>
  </div>

  <div id="stolenActions" style="display:none">
    <button onclick="recover()">✅ Recover Product</button>
  </div>
</div>

<script>
async function getSigner() {
  const provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  return provider.getSigner();
}

async function transfer() {
  const signer = await getSigner();
  const newOwner = document.getElementById("newOwner").value;
  if (!ethers.isAddress(newOwner)) return alert("Invalid address");

  const c = new ethers.Contract(
    "${CONTRACT_ADDRESS}",
    ["function transferOwnership(string,address)"],
    signer
  );

  const tx = await c.transferOwnership("${gpid}", newOwner);
  alert("Transfer TX: " + tx.hash);
}

async function markStolen() {
  const signer = await getSigner();
  const c = new ethers.Contract(
    "${CONTRACT_ADDRESS}",
    ["function markStolen(string)"],
    signer
  );
  const tx = await c.markStolen("${gpid}");
  alert("Marked stolen: " + tx.hash);
}

async function recover() {
  const signer = await getSigner();
  const c = new ethers.Contract(
    "${CONTRACT_ADDRESS}",
    ["function recoverProduct(string)"],
    signer
  );
  const tx = await c.recoverProduct("${gpid}");
  alert("Recovered: " + tx.hash);
}

if (window.ethereum) {
  window.ethereum.request({ method: "eth_accounts" }).then(accs => {
    if (accs.length && accs[0].toLowerCase() === "${owner}".toLowerCase()) {
      document.getElementById("ownerActions").style.display = "block";
      ${stolen
        ? 'document.getElementById("stolenActions").style.display = "block";'
        : 'document.getElementById("activeActions").style.display = "block";'}
    }
  });
}
</script>

</body>
</html>
    `);

  } catch (e) {
    res.send("<h2>❌ Product Not Found</h2>");
  }
});

app.listen(PORT, () => {
  console.log("TAAS Verifier running on", PORT);
});
