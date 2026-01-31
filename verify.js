const express = require("express");
const { ethers } = require("ethers");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 10000;

const RPC_URL = process.env.RPC_URL;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

const provider = new ethers.JsonRpcProvider(RPC_URL);

const ABI = [
  "function getProduct(string) view returns (string,string,string,string,string,string,uint256,address,address)"
];

const contract = new ethers.Contract(
  CONTRACT_ADDRESS,
  ABI,
  provider
);

app.get("/verify", async (req, res) => {
  try {
    const gpid = req.query.gpid;
    const p = await contract.getProduct(gpid);

    res.json({
      gpid: p[0],
      brand: p[1],
      model: p[2],
      category: p[3],
      factory: p[4],
      batch: p[5],
      bornAt: new Date(Number(p[6]) * 1000),
      issuer: p[7],
      owner: p[8]
    });
  } catch (err) {
    res.status(404).json({ error: "PRODUCT_NOT_FOUND" });
  }
});

app.listen(PORT, () => {
  console.log("TAAS Verifier running on", PORT);
});