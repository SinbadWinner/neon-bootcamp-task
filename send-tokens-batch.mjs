#!/usr/bin/env node
import dotenv from "dotenv";
import { Contract, JsonRpcProvider, Wallet, parseUnits } from "ethers";
import { Connection, PublicKey, Keypair, Transaction } from "@solana/web3.js";
import { getAssociatedTokenAddress, createTransferInstruction, createMintToInstruction } from "@solana/spl-token";
import bs58 from "bs58";

dotenv.config();

// === Конфиги ===
const SOLANA_NODE = "https://api.devnet.solana.com";
const NEON_NODE = "https://devnet.neonevm.org";

const tokenMint = new PublicKey("GdLoLpQCU4knhh4KBBLN1DZQ2i1iN7RX6oF73Uzo9pPG");
const erc20Address = "0x3483e78a0dcBdA4CAFe4b9A7828DF84647623661";         
const helperContractAddress = "0x53c9658E3f2B419990f5f583F8048846c27b87bc";   
const recipientSolanaAddress = new PublicKey("EXkszSH44Dqrz7c4khWmNYLo5zsuiYN4Y2Aebzvx3ofW"); // USER1

const lamportsToMint = parseUnits("1000", 9); // 1000 токенов
const lamportsToSend = parseUnits("10", 9);   // 10 токенов

// === Кошельки
const solanaKeypair = Keypair.fromSecretKey(bs58.decode(process.env.PRIVATE_KEY_SOLANA));
const provider = new JsonRpcProvider(NEON_NODE);
const wallet = new Wallet(process.env.PRIVATE_KEY_OWNER, provider);

// === Контракт helper
const helperAbi = [
  {
    "inputs": [
      { "internalType": "bytes[]", "name": "instructions", "type": "bytes[]" },
      { "internalType": "uint64[]", "name": "seeds", "type": "uint64[]" }
    ],
    "name": "batchExecute",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
];
const helperContract = new Contract(helperContractAddress, helperAbi, wallet);

async function main() {
  const connection = new Connection(SOLANA_NODE, "confirmed");

  // ⚠️ Указываем валидный контрактный Solana паблик напрямую (пример — ATA контракта)
  const contractSolanaPublicKey = new PublicKey("FDtudU8vvfNUBJDqaessTeDFXkkdLxXHG2N7i7byn3kk");

  const senderATA = await getAssociatedTokenAddress(tokenMint, contractSolanaPublicKey, true);
  const recipientATA = await getAssociatedTokenAddress(tokenMint, recipientSolanaAddress, true);

  console.log(`Sender ATA: ${senderATA.toBase58()}`);
  console.log(`Recipient ATA: ${recipientATA.toBase58()}`);

  const solanaTx = new Transaction();

  // === Mint токены на senderATA
  solanaTx.add(
    createMintToInstruction(
      tokenMint,
      senderATA,
      contractSolanaPublicKey,
      BigInt(lamportsToMint.toString()) // фикс
    )
  );

  // === Transfer токены с senderATA на recipientATA
  solanaTx.add(
    createTransferInstruction(
      senderATA,
      recipientATA,
      contractSolanaPublicKey,
      BigInt(lamportsToSend.toString()) // фикс
    )
  );

  // === Собираем инструкции
  const instructions = solanaTx.instructions.map(instr => "0x" + instr.data.toString('hex'));
  const seeds = new Array(instructions.length).fill(0);

  // === Отправка через batchExecute
  console.log("Отправляем batchExecute через helper...");
  const tx = await helperContract.batchExecute(instructions, seeds, { value: 0 });
  console.log("Транзакция отправлена:", tx.hash);

  const receipt = await tx.wait();
  console.log("BatchExecute подтверждён в блоке:", receipt.blockNumber);
}

main().catch(console.error);
