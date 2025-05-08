require("dotenv").config();

module.exports = {
  networks: {
    neonDevnet: {
      url: "https://devnet.neonevm.org",
      accounts: [process.env.PRIVATE_KEY_OWNER]
    }
  },
  solidity: "0.8.23",
};
