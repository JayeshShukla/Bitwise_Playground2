const config = {
  networks: {
    ethereum: {
      name: "Ethereum Mainnet",
      rpc: `https://eth-mainnet.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_MAINNET_API_KEY}`,
    },
    sepolia: {
      name: "Ethereum Sepolia",
      rpc: `https://worldchain-mainnet.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_SEPOLIA_API_KEY}`,
    },
    polygon: {
      name: "Polygon Mainnet",
      rpc: `https://polygon-mainnet.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_POLYGON_KEY}`,
    },
    sepoliaBase: {
      name: "Sepolia Base",
      rpc: `https://base-sepolia.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_SEPOLIA_BASE_KEY}`,
    },
    mainnetBase: {
      name: "Base Mainnet",
      rpc: `https://base-mainnet.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_MAINNET_BASE_KEY}`,
    },
  },
};

export default config; // Use `export default` for frontend projects
