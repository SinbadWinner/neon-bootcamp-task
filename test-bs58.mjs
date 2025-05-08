#!/usr/bin/env node
const bs58 = (await import('bs58')).default;

const pubkey = "EXkszSH44Dqrz7c4khWmNYLo5zsuiYN4Y2Aebzvx3ofW";

const decoded = bs58.decode(pubkey);

console.log("📜 Расшифрованный адрес:");
console.log(decoded);
console.log("🔢 Длина в байтах:", decoded.length);
