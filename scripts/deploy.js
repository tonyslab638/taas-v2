const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  const balance = await hre.ethers.provider.getBalance(deployer.address);

  console.log("====================================");
  console.log("Deploying with:", deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "ETH");
  console.log("====================================");

  const Factory = await hre.ethers.getContractFactory(
    "contracts/TaaSProductCore.sol:TaaSProductCore"
  );

  console.log("Preparing contract factory...");

  const contract = await Factory.deploy();

  console.log("Transaction sent...");
  console.log("TX Hash:", contract.deploymentTransaction().hash);

  console.log("Waiting for confirmation...");
  await contract.waitForDeployment();

  const address = await contract.getAddress();

  console.log("====================================");
  console.log("CONTRACT DEPLOYED SUCCESSFULLY");
  console.log("Contract Address:", address);
  console.log("====================================");
}

main().catch((error) => {
  console.error("DEPLOY FAILED:");
  console.error(error);
  process.exit(1);
});