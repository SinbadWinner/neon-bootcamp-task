require('dotenv').config();
const { ethers } = require("hardhat");
const bs58 = require('bs58');
const { PublicKey, SystemProgram, TransactionInstruction } = require('@solana/web3.js');

async function main() {
  const [deployer] = await ethers.getSigners();

  const helperAddress = "0x53c9658E3f2B419990f5f583F8048846c27b87bc"; // <- сюда вставь адрес твоего TestDevBootcamp контракта
  const HelperContract = await ethers.getContractFactory("TestDevBootcamp");
  const helper = await HelperContract.attach(helperAddress);

  // Адрес токена SPL (Mint address) — его надо получить или вручную вставить
  const mintAddress = new PublicKey("ТВОЙ_MINT_ADDRESS"); // адрес созданного токена
  const fromWallet = new PublicKey("ТВОЙ_SOLANA_WALLET_ADDRESS"); // Solana адрес отправителя
  const toWallet = new PublicKey("АДРЕС_ПОЛУЧАТЕЛЯ"); // <- кому отправляем токены (Solana)

  // Эмуляция инструкции transfer (чтобы собрать Solana транзакцию)
  const keys = [
    { pubkey: fromWallet, isSigner: true, isWritable: true },
    { pubkey: toWallet, isSigner: false, isWritable: true },
  ];

  const amount = 1000000000; // 1 токен с decimals = 9
  const instructionData = Buffer.alloc(9);
  instructionData[0] = 3; // 3 = Transfer instruction
  instructionData.writeBigUInt64LE(BigInt(amount), 1);

  const instruction = new TransactionInstruction({
    keys,
    programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"), // стандартный адрес токен-программы Solana
    data: instructionData,
  });

  const solanaAccountsEncoded = ethers.encodeBytes32String(fromWallet.toBase58());
  const instructionEncoded = instruction.data;

  console.log("Calling composability...");

  const tx = await helper.callTransfer(
    solanaAccountsEncoded,
    instructionEncoded,
    { value: ethers.parseEther("0.001") } // Нужно немного NEON для проплаты инструкций
  );

  console.log("Transaction hash:", tx.hash);
  await tx.wait();

  console.log("Transfer instruction sent successfully!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

