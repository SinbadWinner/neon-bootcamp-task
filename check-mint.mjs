#!/usr/bin/env node
import { JsonRpcProvider, Contract } from "ethers";

const provider = new JsonRpcProvider("https://devnet.neonevm.org");
const tokenAddress = "0x3483e78a0dcBdA4CAFe4b9A7828DF84647623661";

const abi = [
  {
    "inputs": [],
    "name": "tokenMint",
    "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
    "stateMutability": "view",
    "type": "function"
  }
];

const token = new Contract(tokenAddress, abi, provider);

async function main() {
  const mint = await token.tokenMint();
  console.log("Mint SPL (bytes32):", mint);
}

main().catch(console.error);
