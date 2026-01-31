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
// PROVIDER (READ)
// =======================
const provider = new ethers.JsonRpcProvider(RPC_URL);

// =======================
// ABI (READ + TRANSFER)
// =======================
const ABI = [
  "function getProduct(string) view returns (string,string,string,string,string,string,uint256,address,address,bool)",
  "function transferOwnership(string,address)"
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

        <p><b>Status:</b> ${stolen ? "🚨 STOLEN" : "ACTIVE"}</p>
        <p><b>Owner:</b> ${owner}</p>

        <div id="transferBox" style="display:none">
          <h3>Transfer Ownership</h3>
          <input id="newOwner" placeholder="0xBuyerAddress" style="width:400px" />
          <br/><br/>
          <button onclick="transfer()">Transfer Product</button>
        </div>

        <script>
          async function transfer() {
            if (!window.ethereum) return alert("Wallet not detected");

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const addr = await signer.getAddress();

            if (addr.toLowerCase() !== "${owner}".toLowerCase()) {
              return alert("You are not the owner");
            }

            const newOwner = document.getElementById("newOwner").value;
            if (!ethers.isAddress(newOwner)) {
              return alert("Invalid address");
            }

            const c = new ethers.Contract(
              "${CONTRACT_ADDRESS}",
              ["function transferOwnership(string,address)"],
              signer
            );

            const tx = await c.transferOwnership("${gpid}", newOwner);
            alert("Transfer TX sent: " + tx.hash);
          }

          if (window.ethereum) {
            window.ethereum.request({ method: "eth_accounts" }).then(accs => {
              if (accs.length && accs[0].toLowerCase() === "${owner}".toLowerCase()) {
                document.getElementById("transferBox").style.display = "block";
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