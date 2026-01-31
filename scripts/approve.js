const hre = require("hardhat");

async function main() {
  const [admin] = await hre.ethers.getSigners();

  const CONTRACT = "0xddead6f20d56a3f4bf5e387d5a96ccd00a1f91e3";
  const BRAND_WALLET = "0xf77A9b486eDE517E957d700f57f88680381dcCC7";

  const ABI = [
    "function approveIssuer(address issuer)"
  ];

  const contract = new hre.ethers.Contract(CONTRACT, ABI, admin);

  const tx = await contract.approveIssuer(BRAND_WALLET);
  console.log("Approve tx:", tx.hash);

  await tx.wait();

  console.log("Approved issuer:", BRAND_WALLET);
}

main().catch((e) => {
  console.error("ERROR:", e);
});
