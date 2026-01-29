const express = require("express");
const { ethers } = require("ethers");

const app = express();
app.use(express.json());

// ===== CONFIG =====
const RPC_URL = process.env.RPC_URL || "https://polygon-mainnet.g.alchemy.com/v2/jyVOlegRibEBpVE-2bOHV";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0xad622e40696eeb98115816682d004bfda83d2555d87b664e8a56aa4bb787b7fe";
const CONTRACT_ADDRESS = process.env.CONTRACT || "0xddead6f20d56a3f4bf5e387d5a96ccd00a1f91e3";
// ==================

const ABI = [
  "function birthProduct(string,string,string,string,string,string,bytes32)",
  "function approveIssuer(address)"
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

app.post("/api/create", async (req, res) => {
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
    res.json({ success: true, tx: tx.hash, block: r.blockNumber });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(10000, () => {
  console.log("TAAS Panel running on 10000");
});
