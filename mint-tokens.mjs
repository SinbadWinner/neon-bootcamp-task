#!/usr/bin/env node
import dotenv from "dotenv";
import { JsonRpcProvider, Wallet, Contract, parseUnits } from "ethers";

dotenv.config();

// === ТВОИ ДАННЫЕ ===
const provider = new JsonRpcProvider("https://devnet.neonevm.org");
const privateKey = process.env.PRIVATE_KEY_OWNER;
const wallet = new Wallet(privateKey, provider);

const erc20Address = "0x3483e78a0dcBdA4CAFe4b9A7828DF84647623661"; // твой токен
const amount = parseUnits("100000", 9); // 1000 токенов с 9 знаками

// ABI с методом mint
const erc20Abi = [
  {
    "inputs": [
      { "internalType": "address", "name": "account", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const contract = new Contract(erc20Address, erc20Abi, wallet);

async function main() {
  console.log("Минтим токены...");
  const tx = await contract.mint(wallet.address, amount);
  console.log("Транзакция отправлена:", tx.hash);
  const receipt = await tx.wait();
  console.log("Готово. Токены сминчены в блоке:", receipt.blockNumber);
}

main().catch(console.error);
