require('dotenv').config();
const { ethers } = require("hardhat");

async function main() {
  const factoryAddress = "0xF6b17787154C418d5773Ea22Afc87A95CAA3e957"; // Адрес фабрики Neon Devnet
  const factoryAbi = [
    "function createErc20ForSplMintable(string memory name, string memory symbol, uint8 decimals, address mintAuthority) public returns (address)"
  ];

  const [deployer] = await ethers.getSigners();

  console.log("Deploying with address:", deployer.address);

  const factory = new ethers.Contract(factoryAddress, factoryAbi, deployer);

  const tokenName = "MyBootcampToken_" + Date.now();
  const tokenSymbol = "MBT";
  const decimals = 9;

  const tx = await factory.createErc20ForSplMintable(tokenName, tokenSymbol, decimals, deployer.address);
  console.log("Transaction sent:", tx.hash);

  const receipt = await tx.wait();
  console.log("Deployment completed, receipt:", receipt);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
