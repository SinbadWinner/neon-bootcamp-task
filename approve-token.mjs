#!/usr/bin/env node
import dotenv from "dotenv";
import { parseUnits, JsonRpcProvider, Wallet, Contract } from "ethers";

dotenv.config();

// === ТВОИ ДАННЫЕ ===
const helperContractAddress = "0x53c9658E3f2B419990f5f583F8048846c27b87bc"; // Адрес хелпера
const erc20TokenAddress = "0x3483e78a0dcBdA4CAFe4b9A7828DF84647623661";   // токен
const amountToApprove = parseUnits("1", 9); // На сколько токенов делать approve

const erc20Abi = [
  {
    "constant": false,
    "inputs": [
      { "name": "_spender", "type": "address" },
      { "name": "_value", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "name": "success", "type": "bool" }],
    "type": "function"
  }
];

const privateKey = process.env.PRIVATE_KEY_OWNER;
if (!privateKey) throw new Error("PRIVATE_KEY_OWNER не найден в .env");

const provider = new JsonRpcProvider("https://devnet.neonevm.org");
const wallet = new Wallet(privateKey, provider);
const token = new Contract(erc20TokenAddress, erc20Abi, wallet);

async function main() {
  console.log("Делаем approve хелперу на", amountToApprove.toString(), "токенов...");
  const tx = await token.approve(helperContractAddress, amountToApprove);
  console.log("Approve транзакция отправлена:", tx.hash);

  const receipt = await tx.wait();
  console.log("Approve подтверждён в блоке:", receipt.blockNumber);
}

main().catch(console.error);
