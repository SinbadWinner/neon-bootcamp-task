#!/usr/bin/env node
import { Connection, PublicKey, Keypair, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  const connection = new Connection("https://api.devnet.solana.com", "confirmed");

  const mintAddress = new PublicKey("GdLoLpQCU4knhh4KBBLN1DZQ2i1iN7RX6oF73Uzo9pPG"); // SPL токен
  const ownerAddress = new PublicKey("EXkszSH44Dqrz7c4khWmNYLo5zsuiYN4Y2Aebzvx3ofW"); // USER1 паблик

  const payerSecret = JSON.parse(process.env.PRIVATE_KEY_SOLANA);
  const payer = Keypair.fromSecretKey(Uint8Array.from(payerSecret));

  const ataAddress = await getAssociatedTokenAddress(mintAddress, ownerAddress);
  const accountInfo = await connection.getAccountInfo(ataAddress);

  if (accountInfo !== null) {
    console.log("ATA уже существует:", ataAddress.toBase58());
    return;
  }

  const tx = new Transaction().add(
    createAssociatedTokenAccountInstruction(
      payer.publicKey,
      ataAddress,
      ownerAddress,
      mintAddress,
      TOKEN_PROGRAM_ID
    )
  );

  const sig = await sendAndConfirmTransaction(connection, tx, [payer]);
  console.log("ATA создан:", ataAddress.toBase58());
  console.log("Signature:", sig);
}

main().catch(console.error);
