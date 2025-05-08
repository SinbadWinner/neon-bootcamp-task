#!/usr/bin/env node
import hardhat from "hardhat";
import bs58 from "bs58";

const { ethers } = hardhat;

async function main() {
  const tokenAddress = "0x3483e78a0dcbda4cafe4b9a7828df84647623661"; // обязательно маленькими буквами

  const abi = [
    "function tokenMint() external view returns (bytes32)"
  ];

  const contract = await ethers.getContractAt(abi, tokenAddress);

  const tokenMintBytes32 = await contract.tokenMint();
  console.log("Token Mint (bytes32):", tokenMintBytes32);

  // Конвертация bytes32 в нормальный base58 Solana адрес
  const mintBytes = ethers.getBytes(tokenMintBytes32);
  const mintBase58 = bs58.encode(mintBytes);

  console.log("Mint Address для Solana (base58):", mintBase58);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
