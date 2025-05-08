#!/usr/bin/env node
import { Connection, PublicKey } from "@solana/web3.js";

const helperAddressSolana = "53c9658E3f2B419990f5f583F8048846c27b87bc"; // отрезать 0x

async function main() {
  const connection = new Connection("https://api.devnet.solana.com");
  const pubkey = new PublicKey(helperAddressSolana.padStart(44, "1")); // костыль из-за формата
  const balanceLamports = await connection.getBalance(pubkey);
  console.log("Баланс хелпера в лампортах:", balanceLamports);
  console.log("Баланс в SOL:", balanceLamports / 1e9);
}

main().catch(console.error);
