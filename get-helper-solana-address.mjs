import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  const provider = new ethers.JsonRpcProvider("https://devnet.neonevm.org");
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY_OWNER, provider);

  const helperAddress = "0x53c9658E3f2B419990f5f583F8048846c27b87bc"; // твой helper контракт
  const helperAbi = [
    "function getNeonAddress(address) external view returns (bytes32)"
  ];

  const helper = new ethers.Contract(helperAddress, helperAbi, signer);

  const neonBytes = await helper.getNeonAddress(helperAddress);
  const solanaAddress = ethers.encodeBase58(neonBytes);

  console.log("Solana PublicKey контракта:", solanaAddress);
}

main().catch(console.error);
