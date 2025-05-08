const { ethers } = require("hardhat");
const web3 = require("@solana/web3.js");
const bs58 = require("bs58");
const {
  getAssociatedTokenAddress,
  createTransferInstruction,
  createMintToInstruction
} = require('@solana/spl-token');
require("dotenv").config();
const { batchExecute } = require("./utils");

async function main() {
  console.log("✅ Скрипт запущен!");

  const connection = new web3.Connection("https://api.devnet.solana.com", "confirmed");

  const [user1] = await ethers.getSigners();
  console.log("✅ Получен юзер:", user1.address);

  const tokenMint = new web3.PublicKey("GdLoLpQCU4knhh4KBBLN1DZQ2i1iN7RX6oF73Uzo9pPG");
  const helperAddress = "0x53c9658E3f2B419990f5f583F8048846c27b87bc";

  console.log("✅ Подключаемся к контракту helper...");
  const helper = await ethers.getContractAt("TestDevBootcamp", helperAddress);

  console.log("✅ Получаем Solana адреса через getNeonAddress...");
  const contractSolanaPubkey = new web3.PublicKey(
    ethers.encodeBase58(await helper.getNeonAddress(helperAddress))
  );

  const user1SolanaPubkey = new web3.PublicKey(
    ethers.encodeBase58(await helper.getNeonAddress(user1.address))
  );

  console.log("✅ Вычисляем ATA...");
  const senderATA = await getAssociatedTokenAddress(tokenMint, contractSolanaPubkey, true);
  const recipientATA = await getAssociatedTokenAddress(tokenMint, user1SolanaPubkey, true);

  console.log("📦 Sender ATA:", senderATA.toBase58());
  console.log("📦 Recipient ATA:", recipientATA.toBase58());

  console.log("✅ Проверяем существование ATA аккаунтов...");
  const senderInfo = await connection.getAccountInfo(senderATA);
  const recipientInfo = await connection.getAccountInfo(recipientATA);

  if (!senderInfo || !recipientInfo) {
    console.log("❌ Один из ATA не существует. Сначала запусти скрипт CreateATA.");
    return;
  }

  console.log("✅ Создаём инструкции mint + transfer...");
  const solanaTx = new web3.Transaction();

  solanaTx.add(
    createMintToInstruction(tokenMint, senderATA, contractSolanaPubkey, BigInt(1000 * 10 ** 9))
  );

  solanaTx.add(
    createTransferInstruction(senderATA, recipientATA, contractSolanaPubkey, BigInt(10 * 10 ** 9))
  );

  console.log("🚀 Отправляем batchExecute через helper контракт...");
  const [tx, receipt] = await batchExecute(
    solanaTx.instructions,
    [0, 0],
    helper,
    undefined,
    user1
  );

  console.log("✅ Успех! Транзакция отправлена. Tx:", tx.hash);
}

// 🧠 Правильный вызов
main().catch((error) => {
  console.error("❌ Ошибка:", error);
  process.exitCode = 1;
});
