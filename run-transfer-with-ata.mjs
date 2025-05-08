import hardhat from "hardhat";
import bs58 from "bs58";
import { PublicKey, Connection, clusterApiUrl, Keypair } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, getAccount, getAssociatedTokenAddress, createTransferInstruction } from "@solana/spl-token";

const { ethers } = hardhat;

async function main() {
  const [deployer] = await ethers.getSigners();

  const helperContractAddress = "0x53c9658E3f2B419990f5f583F8048846c27b87bc"; // твой helper
  const tokenContractAddress = "0x3483e78a0dcbda4cafe4b9a7828df84647623661"; // токен-обертка

  const helper = await ethers.getContractAt("TestDevBootcamp", helperContractAddress);

  const mintAddress = new PublicKey("ТВОЙ_MINT_АДРЕС_SPL"); // <- сюда вставить Mint токена
  const fromSolanaAddress = new PublicKey("ТВОЙ_SOLANA_АДРЕС"); // <- твой Solana-кошелек
  const toSolanaAddress = new PublicKey("EXkszSH44Dqrz7c4khWmNYLo5zsuiYN4Y2Aebzvx3ofW"); // <- получатель

  const connection = new Connection("https://api.devnet.solana.com");

  // Найти ATA
  const fromATA = await getAssociatedTokenAddress(mintAddress, fromSolanaAddress, false, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);
  const toATA = await getAssociatedTokenAddress(mintAddress, toSolanaAddress, false, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);

  console.log("🔍 Проверяем ATA аккаунты...");

  const createInstructions = [];

  try {
    await getAccount(connection, fromATA);
    console.log("ATA отправителя существует");
  } catch (e) {
    console.log("Создаём ATA для отправителя...");
    createInstructions.push(
      createAssociatedTokenAccountInstruction(
        fromSolanaAddress,
        fromATA,
        fromSolanaAddress,
        mintAddress
      )
    );
  }

  try {
    await getAccount(connection, toATA);
    console.log("✅ ATA получателя существует");
  } catch (e) {
    console.log("⚙ Создаём ATA для получателя...");
    createInstructions.push(
      createAssociatedTokenAccountInstruction(
        fromSolanaAddress,
        toATA,
        toSolanaAddress,
        mintAddress
      )
    );
  }

  // Теперь строим инструкцию перевода токенов
  const amount = BigInt(1000 * 10 ** 9); // 1000 токенов (9 знаков)

  const transferIx = createTransferInstruction(
    fromATA,
    toATA,
    fromSolanaAddress,
    amount,
    [],
    TOKEN_PROGRAM_ID
  );

  console.log("✅ Инструкция передачи токенов построена");

  // Формируем пакеты для Neon precompile
  const solanaAccounts = ethers.AbiCoder.defaultAbiCoder().encode(
    ["bytes"],
    [Buffer.concat([...createInstructions.map(ix => Buffer.concat(ix.keys.map(k => k.pubkey.toBuffer()))), Buffer.concat(transferIx.keys.map(k => k.pubkey.toBuffer()))])]
  );

  const solanaInstruction = ethers.AbiCoder.defaultAbiCoder().encode(
    ["bytes"],
    [Buffer.concat([...createInstructions.map(ix => ix.data), transferIx.data])]
  );

  console.log(`📤 Отправляем через helper контракт с адреса: ${deployer.address}`);

  const tx = await helper.callTransfer(solanaAccounts, solanaInstruction, { value: 0 });

  console.log("⏳ Ждём подтверждения...");
  await tx.wait();

  console.log("🎯 Токены реально переданы на Solana через Neon EVM!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
