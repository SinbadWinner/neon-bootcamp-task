require('dotenv').config();
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying helper contract with address:", deployer.address);

  const HelperContract = await ethers.getContractFactory("TestDevBootcamp");
  const helper = await HelperContract.deploy();
  await helper.waitForDeployment();

  console.log("Helper contract deployed at:", await helper.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
