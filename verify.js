const express = require("express");
const { ethers } = require("ethers");

const app = express();

// ===== ENV CONFIG =====
const RPC_URL = process.env.RPC_URL;
const CONTRACT = process.env.CONTRACT;

if (!RPC_URL || !CONTRACT) {
  console.error("Missing RPC_URL or CONTRACT in env");
  process.exit(1);
}

// ===== ABI (READ + CLAIM) =====
const ABI = [
  "function getCore(string) view returns (string,string,string,string,string,string)",
  "function getMeta(string) view returns (uint256,address,bytes32)",
  "function getState(string) view returns (address,bool)",
  "function claimOwnership(string)"
];

// ===== CHAIN =====
const provider = new ethers.JsonRpcProvider(RPC_URL);
const contract = new ethers.Contract(CONTRACT, ABI, provider);

// ===== BOOT =====
(async () => {
  const net = await provider.getNetwork();
  console.log("========== TAAS VERIFY V3.2 ==========");
  console.log("Chain:", net.chainId.toString());
  console.log("Contract:", CONTRACT);
  console.log("=====================================");
})();

// ===== HOME =====
app.get("/", (req, res) => {
  res.send(`
    <h2>ASJUJ Verifier</h2>
    <form method="GET" action="/verify">
      <input name="gpid" placeholder="Enter GPID" />
      <button>Verify</button>
    </form>
  `);
});

// ===== VERIFY =====
app.get("/verify", async (req, res) => {
  const gpid = (req.query.gpid || "").trim();
  if (!gpid) return res.send("Invalid GPID");

  try {
    const core = await contract.getCore(gpid);
    const meta = await contract.getMeta(gpid);
    const state = await contract.getState(gpid);

    const owner = state[0];
    const stolen = state[1];

    res.send(`
      <html>
        <head>
          <script src="https://cdn.jsdelivr.net/npm/ethers@6.16.0/dist/ethers.min.js"></script>
        </head>
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

          <p><b>Owner:</b> ${
            owner === ethers.ZeroAddress ? "Not claimed" : owner
          }</p>

          ${
            stolen
              ? "<h2 style='color:red'>⚠ STOLEN</h2>"
              : ""
          }

          ${
            owner === ethers.ZeroAddress
              ? `
                <button onclick="claim()">Claim Ownership</button>
              `
              : ""
          }

          <p id="status"></p>

          <script>
            async function claim() {
              if (!window.ethereum) {
                alert("MetaMask required");
                return;
              }

              const provider = new ethers.BrowserProvider(window.ethereum);
              await provider.send("eth_requestAccounts", []);
              const signer = await provider.getSigner();

              const contract = new ethers.Contract(
                "${CONTRACT}",
                ${JSON.stringify(ABI)},
                signer
              );

              document.getElementById("status").innerText = "Claiming ownership...";

              const tx = await contract.claimOwnership("${gpid}");
              await tx.wait();

              document.getElementById("status").innerText =
                "✔ Ownership claimed. Refresh page.";
            }
          </script>

          <hr/>
          <p style="color:#4cff4c">Authentic product on ASJUJ Network</p>

        </body>
      </html>
    `);
  } catch (e) {
    res.send(`
      <h1>❌ Product Not Found</h1>
      <p>This GPID is not registered on ASJUJ Network.</p>
    `);
  }
});

// ===== START =====
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("TAAS Verifier V3.2 running on", PORT);
});
