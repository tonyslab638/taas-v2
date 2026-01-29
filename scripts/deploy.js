const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying with:", deployer.address);

  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Balance:", balance.toString());

  const Factory = await hre.ethers.getContractFactory("TaaSProductBirthV2");
  console.log("Contract factory loaded");

  const contract = await Factory.deploy();
  console.log("Deploy tx sent:", contract.deploymentTransaction().hash);

  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("=====================================");
  console.log("TaaSProductBirthV2 deployed at:");
  console.log(address);
  console.log("=====================================");
}

main().catch((error) => {
  console.error("DEPLOY ERROR:", error);
  process.exitCode = 1;
});
