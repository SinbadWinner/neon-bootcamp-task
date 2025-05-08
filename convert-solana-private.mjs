import bs58 from "bs58";
import fs from "fs";

const PRIVATE_KEY_SOLANA = "000000000000000000000000000"; // вставь приватник base58

const decoded = bs58.decode(PRIVATE_KEY_SOLANA);
const array = Array.from(decoded);

console.log("Вот твой приватник в формате массива:");
console.log(JSON.stringify(array));

// Можешь сохранить сразу в файл если хочешь
fs.writeFileSync("solana_private_array.json", JSON.stringify(array, null, 2));
console.log("Сохранено в solana_private_array.json");
