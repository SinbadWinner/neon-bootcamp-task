#!/usr/bin/env node
import dotenv from "dotenv";
import { parseUnits, JsonRpcProvider, Wallet, Contract } from "ethers";

dotenv.config();

const helperContractAddress = "0x53c9658E3f2B419990f5f583F8048846c27b87bc";
const erc20TokenAddress = "0x3483e78a0dcBdA4CAFe4b9A7828DF84647623661";
const amountToSend = parseUnits("1", 9); // 1 токен
const neonRecipient = "0xc908f7f773db7bee87b96052bf86b480eb305cbdd3ffda31be6bff5bca336651";

const helperAbi = [
  {
    "inputs": [
      { "internalType": "address", "name": "tokenMint", "type": "address" },
      { "internalType": "bytes", "name": "receiver", "type": "bytes" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "call_transfer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const privateKey = process.env.PRIVATE_KEY_OWNER;
if (!privateKey) throw new Error("PRIVATE_KEY_OWNER не найден в .env");

const provider = new JsonRpcProvider("https://devnet.neonevm.org");
const wallet = new Wallet(privateKey, provider);
const helper = new Contract(helperContractAddress, helperAbi, wallet);

async function main() {
  console.log("Отправляем токены через helper контракт...");
  const tx = await helper.call_transfer(erc20TokenAddress, neonRecipient, amountToSend);
  console.log("Транзакция отправлена:", tx.hash);

  const receipt = await tx.wait();
  console.log("Транзакция подтверждена в блоке:", receipt.blockNumber);
}

main().catch(console.error);
