import hardhat from "hardhat";
import bs58 from "bs58";

const { ethers } = hardhat;

async function main() {
  const [deployer] = await ethers.getSigners();

  const helperContractAddress = "0x53c9658E3f2B419990f5f583F8048846c27b87bc"; // Mой helper
  const tokenContractAddress = "0x3483e78a0dcBdA4CAFe4b9A7828DF84647623661"; // Mой токен

  const helper = await ethers.getContractAt("TestDevBootcamp", helperContractAddress);

  const recipientSolanaAddress = "EXkszSH44Dqrz7c4khWmNYLo5zsuiYN4Y2Aebzvx3ofW";

  const recipientPublicKeyBytes = bs58.decode(recipientSolanaAddress);

  const amount = ethers.parseUnits("1000", 9); // 1000 токенов с 9 знаками

  console.log("Строим Solana инструкции...");

  const solanaAccounts = ethers.AbiCoder.defaultAbiCoder().encode(
    ["bytes"],
    [recipientPublicKeyBytes]
  );

  const solanaInstruction = ethers.AbiCoder.defaultAbiCoder().encode(
    ["address", "uint256"],
    [tokenContractAddress, amount]
  );

  console.log('Отправляем токены через helper контракт с адреса: ${deployer.address}`);

  const tx = await helper.callTransfer(solanaAccounts, solanaInstruction, { value: 0 });
  console.log("Ждём подтверждение транзакции...");

  await tx.wait();
  console.log("Токены успешно переданы на Solana через Neon precompile!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
