const { ethers } = require("hardhat");

function instructionToHex(ix) {
  return "0x" + ix.data.toString("hex");
}

async function batchExecute(instructions, lamportsArray, contract, payer, signer) {
  const hexInstructions = instructions.map(instructionToHex);
  const tx = await contract.batchExecute(hexInstructions, lamportsArray, { value: 0 });
  const receipt = await tx.wait();
  return [tx, receipt];
}

module.exports = {
  batchExecute
};
