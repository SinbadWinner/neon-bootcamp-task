const { ethers } = require("hardhat");
const web3 = require("@solana/web3.js");
const { getAssociatedTokenAddress, createTransferInstruction } = require('@solana/spl-token');
require("dotenv").config();
const { batchExecute } = require("./utils");

async function main() {
  console.log("Скрипт запущен!");

  const connection = new web3.Connection("https://api.devnet.solana.com", "confirmed");
  const [user1] = await ethers.getSigners();

  console.log("Получен юзер:", user1.address);

  const tokenMint = new web3.PublicKey("GdLoLpQCU4knhh4KBBLN1DZQ2i1iN7RX6oF73Uzo9pPG");
  const helperAddress = "0x53c9658E3f2B419990f5f583F8048846c27b87bc";

  const helper = await ethers.getContractAt("TestDevBootcamp", helperAddress);

  const contractSolanaPubkey = new web3.PublicKey(
    ethers.encodeBase58(await helper.getNeonAddress(helperAddress))
  );

  const user1SolanaPubkey = new web3.PublicKey(
    ethers.encodeBase58(await helper.getNeonAddress(user1.address))
  );

  const senderATA = await getAssociatedTokenAddress(tokenMint, contractSolanaPubkey, true);
  const recipientATA = await getAssociatedTokenAddress(tokenMint, user1SolanaPubkey, true);

  console.log("Sender ATA:", senderATA.toBase58());
  console.log("Recipient ATA:", recipientATA.toBase58());

  const senderInfo = await connection.getAccountInfo(senderATA);
  const recipientInfo = await connection.getAccountInfo(recipientATA);

  if (!senderInfo || !recipientInfo) {
    console.log("Один из ATA не существует. Создай ATA сначала.");
    return;
  }

  const solanaTx = new web3.Transaction();
  solanaTx.add(
    createTransferInstruction(
      senderATA,
      recipientATA,
      contractSolanaPubkey,
      BigInt(10 * 10 ** 9) // Перевод 10 токенов
    )
  );

  console.log("Отправляем через batchExecute...");
  const [tx, receipt] = await batchExecute(
    solanaTx.instructions,
    [0],
    helper,
    undefined,
    user1
  );

  console.log("Успех! Транзакция:", tx.hash);
}

main().catch((error) => {
  console.error("Ошибка:", error);
  process.exitCode = 1;
});
