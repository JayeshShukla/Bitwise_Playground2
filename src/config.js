const config = {
  networks: {
    ethereum: {
      name: "Ethereum Mainnet",
      rpc: `https://eth-mainnet.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_ETHEREUM_API_KEY}`,
    },
    sepolia: {
      name: "Ethereum Sepolia",
      rpc: `https://worldchain-mainnet.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_ETHEREUM_API_KEY}`,
    },
    polygon: {
      name: "Polygon Mainnet",
      rpc: `https://polygon-mainnet.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_POLYGON_KEY}`,
    },
    polygonAmoy: {
      name: "Polygon Testnet",
      rpc: `https://polygon-amoy.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_POLYGON_KEY}`,
    },
    sepoliaBase: {
      name: "Sepolia Base",
      rpc: `https://base-sepolia.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_BASE_KEY}`,
    },
    mainnetBase: {
      name: "Base Mainnet",
      rpc: `https://base-mainnet.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_BASE_KEY}`,
    },
    mainnetZeta: {
      name: "Zeta Mainnet",
      rpc: `https://zetachain-mainnet.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_ZETA_KEY}`,
    },
    testnetZeta: {
      name: "Zeta Testnet",
      rpc: `https://zetachain-testnet.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_ZETA_KEY}`,
    },
  },
};

export default config; // Use `export default` for frontend projects
