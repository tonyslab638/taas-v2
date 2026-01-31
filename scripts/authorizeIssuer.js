const hre = require("hardhat");

async function main() {
  const ethers = hre.ethers;

  const [admin] = await ethers.getSigners();
  console.log("Admin wallet:", admin.address);

  const CONTRACT_ADDRESS = "0x149ecfda9f23a89ee54728e19b8cecc26cd415f7";

  const contract = await ethers.getContractAt(
    "TaaSProductBirthV3",
    CONTRACT_ADDRESS,
    admin
  );

  const tx = await contract.authorizeIssuer(admin.address);
  await tx.wait();

  console.log("✅ Issuer authorized successfully:", admin.address);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
