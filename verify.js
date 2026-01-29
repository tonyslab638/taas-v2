const express = require("express");
const { ethers } = require("ethers");

const RPC_URL = "https://polygon-amoy.g.alchemy.com/v2/YOUR_KEY";
const CONTRACT_ADDRESS = "0xddead6f20d56a3f4bf5e387d5a96ccd00a1f91e3";

const ABI = [
  "function exists(string gpid) view returns (bool)",
  "function getCore(string gpid) view returns (string,string,string,string,string,string)",
  "function getMeta(string gpid) view returns (uint256,address,bytes32)"
];

const provider = new ethers.JsonRpcProvider(RPC_URL);
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

const app = express();

app.get("/", (req, res) => {
  res.send(`
    <form action="/verify">
      <input name="gpid" placeholder="ASJUJ-0001"/>
      <button>Verify</button>
    </form>
  `);
});

app.get("/verify", async (req, res) => {
  const gpid = (req.query.gpid || "").trim();

  try {
    const ok = await contract.exists(gpid);
    if (!ok) return res.send("❌ Not Found");

    const core = await contract.getCore(gpid);
    const meta = await contract.getMeta(gpid);

    res.send(`
      ✔ VERIFIED<br/>
      GPID: ${core[0]}<br/>
      Brand: ${core[1]}<br/>
      Model: ${core[2]}<br/>
      Category: ${core[3]}<br/>
      Factory: ${core[4]}<br/>
      Batch: ${core[5]}<br/>
      Issuer: ${meta[1]}<br/>
      Born: ${new Date(Number(meta[0]) * 1000).toUTCString()}
    `);
  } catch (e) {
    res.send("ERROR: " + e.message);
  }
});

app.listen(10000, () => console.log("Verifier on 10000"));
