const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying with:", deployer.address);

  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Balance:", balance.toString());

  const ContractFactory = await hre.ethers.getContractFactory(
    "TaaSProductBirthV3"
  );

  console.log("Contract factory loaded");

  const contract = await ContractFactory.deploy();
  console.log("Deploy tx sent:", contract.deploymentTransaction().hash);

  await contract.waitForDeployment();

  console.log("✅ Contract deployed at:", contract.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});