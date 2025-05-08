const hre = require("hardhat");

async function main() {
  const tokenAddress = "0x3483e78a0dcbda4cafe4b9a7828df84647623661"; // твой токен

  const abi = [
    "function tokenMint() external view returns (bytes32)"
  ];

  const contract = await hre.ethers.getContractAt(abi, tokenAddress);

  const tokenMintBytes32 = await contract.tokenMint();
  console.log("Token Mint (bytes32):", tokenMintBytes32);

  // Переводим bytes32 в формат Solana address (base58)
  const bs58 = require("bs58");
  const { ethers } = hre;

  const mintPublicKey = bs58.encode(ethers.getBytes(tokenMintBytes32));
  console.log("Mint Address для Solana (base58):", mintPublicKey);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
