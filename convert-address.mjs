#!/usr/bin/env node
import { keccak256, AbiCoder, JsonRpcProvider } from "ethers";

const PRECOMPILE_ADDRESS = "0x0000000000000000000000000000000000000004";

export async function convertSolanaToBytes32(provider, solanaPubkey) {
  const bs58 = (await import('bs58')).default;
  const solanaBytes = bs58.decode(solanaPubkey);

  const abiCoder = AbiCoder.defaultAbiCoder();
  const encodedInput = abiCoder.encode(["bytes"], [solanaBytes]);

  const methodId = keccak256(Buffer.from("solana_address_to_neon(bytes)")).substring(0, 10);
  const data = methodId + encodedInput.slice(2);

  const result = await provider.call({
    to: PRECOMPILE_ADDRESS,
    data: data
  });

  if (result.length !== 66) throw new Error("❌ Precompile вернул неправильные данные");

  return result; // bytes32
}
