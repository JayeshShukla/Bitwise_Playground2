import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Buffer } from "buffer";
import "./styles.css";

// Solana Imports
import {
  ConnectionProvider,
  WalletProvider,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import {
  clusterApiUrl,
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  createAssociatedTokenAccountInstruction,
  getAccount,
} from "@solana/spl-token";
import "@solana/wallet-adapter-react-ui/styles.css";

import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";

// EVM Imports
import { ethers } from "ethers";

// CRITICAL POLYFILL: This prevents Solana web3 from crashing in the browser
window.Buffer = window.Buffer || Buffer;

// --- Chain registry ---------------------------------------------------
// Add a new EVM chain by appending one object here — the chain picker,
// the wallet_switchEthereumChain/wallet_addEthereumChain flow, and the
// transfer logic all read from this list.

const EVM_CHAINS = [
  // --- Mainnets ---
  {
    key: "eth-mainnet",
    type: "evm",
    label: "Ethereum",
    group: "Mainnet",
    chainIdHex: "0x1",
    chainIdDec: 1,
    rpcUrls: ["https://eth.llamarpc.com"],
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    blockExplorerUrls: ["https://etherscan.io"],
  },
  {
    key: "base-mainnet",
    type: "evm",
    label: "Base",
    group: "Mainnet",
    chainIdHex: "0x2105",
    chainIdDec: 8453,
    rpcUrls: ["https://mainnet.base.org"],
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    blockExplorerUrls: ["https://basescan.org"],
  },
  {
    key: "arbitrum-mainnet",
    type: "evm",
    label: "Arbitrum One",
    group: "Mainnet",
    chainIdHex: "0xa4b1",
    chainIdDec: 42161,
    rpcUrls: ["https://arb1.arbitrum.io/rpc"],
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    blockExplorerUrls: ["https://arbiscan.io"],
  },
  {
    key: "optimism-mainnet",
    type: "evm",
    label: "Optimism",
    group: "Mainnet",
    chainIdHex: "0xa",
    chainIdDec: 10,
    rpcUrls: ["https://mainnet.optimism.io"],
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    blockExplorerUrls: ["https://optimistic.etherscan.io"],
  },
  {
    key: "polygon-mainnet",
    type: "evm",
    label: "Polygon",
    group: "Mainnet",
    chainIdHex: "0x89",
    chainIdDec: 137,
    rpcUrls: ["https://polygon-rpc.com"],
    nativeCurrency: { name: "POL", symbol: "POL", decimals: 18 },
    blockExplorerUrls: ["https://polygonscan.com"],
  },
  {
    key: "bsc-mainnet",
    type: "evm",
    label: "BNB Smart Chain",
    group: "Mainnet",
    chainIdHex: "0x38",
    chainIdDec: 56,
    rpcUrls: ["https://bsc-dataseed.binance.org"],
    nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
    blockExplorerUrls: ["https://bscscan.com"],
  },
  {
    key: "avalanche-mainnet",
    type: "evm",
    label: "Avalanche C-Chain",
    group: "Mainnet",
    chainIdHex: "0xa86a",
    chainIdDec: 43114,
    rpcUrls: ["https://api.avax.network/ext/bc/C/rpc"],
    nativeCurrency: { name: "Avalanche", symbol: "AVAX", decimals: 18 },
    blockExplorerUrls: ["https://snowtrace.io"],
  },

  // --- Testnets ---
  {
    key: "eth-sepolia",
    type: "evm",
    label: "Ethereum Sepolia",
    group: "Testnet",
    chainIdHex: "0xaa36a7",
    chainIdDec: 11155111,
    rpcUrls: ["https://rpc.sepolia.org"],
    nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
    blockExplorerUrls: ["https://sepolia.etherscan.io"],
  },
  {
    key: "base-sepolia",
    type: "evm",
    label: "Base Sepolia",
    group: "Testnet",
    chainIdHex: "0x14a34",
    chainIdDec: 84532,
    rpcUrls: ["https://sepolia.base.org"],
    nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
    blockExplorerUrls: ["https://sepolia.basescan.org"],
  },
  {
    key: "arbitrum-sepolia",
    type: "evm",
    label: "Arbitrum Sepolia",
    group: "Testnet",
    chainIdHex: "0x66eee",
    chainIdDec: 421614,
    rpcUrls: ["https://sepolia-rollup.arbitrum.io/rpc"],
    nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
    blockExplorerUrls: ["https://sepolia.arbiscan.io"],
  },
  {
    key: "optimism-sepolia",
    type: "evm",
    label: "Optimism Sepolia",
    group: "Testnet",
    chainIdHex: "0xaa37dc",
    chainIdDec: 11155420,
    rpcUrls: ["https://sepolia.optimism.io"],
    nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
    blockExplorerUrls: ["https://sepolia-optimism.etherscan.io"],
  },
  {
    key: "polygon-amoy",
    type: "evm",
    label: "Polygon Amoy",
    group: "Testnet",
    chainIdHex: "0x13882",
    chainIdDec: 80002,
    rpcUrls: ["https://rpc-amoy.polygon.technology"],
    nativeCurrency: { name: "POL", symbol: "POL", decimals: 18 },
    blockExplorerUrls: ["https://amoy.polygonscan.com"],
  },
  {
    key: "bsc-testnet",
    type: "evm",
    label: "BNB Testnet",
    group: "Testnet",
    chainIdHex: "0x61",
    chainIdDec: 97,
    rpcUrls: ["https://data-seed-prebsc-1-s1.binance.org:8545"],
    nativeCurrency: { name: "BNB", symbol: "tBNB", decimals: 18 },
    blockExplorerUrls: ["https://testnet.bscscan.com"],
  },
  {
    key: "avalanche-fuji",
    type: "evm",
    label: "Avalanche Fuji",
    group: "Testnet",
    chainIdHex: "0xa869",
    chainIdDec: 43113,
    rpcUrls: ["https://api.avax-test.network/ext/bc/C/rpc"],
    nativeCurrency: { name: "Avalanche", symbol: "AVAX", decimals: 18 },
    blockExplorerUrls: ["https://testnet.snowtrace.io"],
  },
];

const SOLANA_CHAINS = [
  {
    key: "solana-mainnet",
    type: "solana",
    label: "Solana",
    group: "Mainnet",
    cluster: "mainnet-beta",
    nativeCurrency: { symbol: "SOL", decimals: 9 },
  },
  {
    key: "solana-devnet",
    type: "solana",
    label: "Solana Devnet",
    group: "Testnet",
    cluster: "devnet",
    nativeCurrency: { symbol: "SOL", decimals: 9 },
  },
];

const CHAINS_BY_KEY = Object.fromEntries(
  [...EVM_CHAINS, ...SOLANA_CHAINS].map((c) => [c.key, c])
);

const CHAIN_GROUPS = [
  { label: "Solana", chains: SOLANA_CHAINS },
  { label: "EVM Mainnets", chains: EVM_CHAINS.filter((c) => c.group === "Mainnet") },
  { label: "EVM Testnets", chains: EVM_CHAINS.filter((c) => c.group === "Testnet") },
];

const DEFAULT_CHAIN_KEY = "solana-devnet";

// --- EIP-6963 multi-wallet discovery -----------------------------------
// Both MetaMask and Phantom (and others) inject an EVM provider onto
// window.ethereum, so whichever one loads/claims it last silently wins —
// that's why "Base Sepolia" kept opening Phantom. EIP-6963 has every
// installed wallet announce itself independently (with its own provider
// object + name/icon), so we can let the user pick the exact wallet
// instead of guessing via the shared global.
function useEvmProviders() {
  const [providers, setProviders] = useState([]); // [{ info: {uuid,name,icon,rdns}, provider }]

  useEffect(() => {
    const onAnnounce = (event) => {
      const { info, provider } = event.detail;
      setProviders((prev) => {
        if (prev.some((p) => p.info.uuid === info.uuid)) return prev;
        return [...prev, { info, provider }];
      });
    };
    window.addEventListener("eip6963:announceProvider", onAnnounce);
    window.dispatchEvent(new Event("eip6963:requestProvider"));
    return () =>
      window.removeEventListener("eip6963:announceProvider", onAnnounce);
  }, []);

  return providers;
}

const UniversalSender = ({ chainKey, setChainKey }) => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const [recipient, setRecipient] = useState("");
  const [tokenAddress, setTokenAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [decimals, setDecimals] = useState("");
  const [status, setStatus] = useState("");

  const evmProviders = useEvmProviders();
  const [selectedEvmRdns, setSelectedEvmRdns] = useState("");

  // Auto-pick when there's exactly one EVM wallet installed; otherwise
  // the user must choose explicitly (that choice is what was missing).
  useEffect(() => {
    if (evmProviders.length === 1 && !selectedEvmRdns) {
      setSelectedEvmRdns(evmProviders[0].info.rdns);
    }
  }, [evmProviders, selectedEvmRdns]);

  const chain = CHAINS_BY_KEY[chainKey];
  const isSolana = chain.type === "solana";

  // Default decimals shown as a placeholder; user can override for
  // non-standard tokens (e.g. 6 for USDC on either ecosystem).
  const defaultDecimals = isSolana ? 6 : 18;
  const resolvedDecimals = decimals === "" ? defaultDecimals : parseInt(decimals, 10);

  // --- SOLANA TRANSFER LOGIC ---
  const handleSolanaTransfer = async () => {
    if (!publicKey) throw new Error("Please connect your Solana wallet.");
    const recipientPubKey = new PublicKey(recipient);
    let transaction = new Transaction();

    if (tokenAddress) {
      const mintPubKey = new PublicKey(tokenAddress);
      const fromTokenAccount = await getAssociatedTokenAddress(
        mintPubKey,
        publicKey
      );
      const toTokenAccount = await getAssociatedTokenAddress(
        mintPubKey,
        recipientPubKey
      );

      try {
        await getAccount(connection, toTokenAccount);
      } catch (e) {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            publicKey,
            toTokenAccount,
            recipientPubKey,
            mintPubKey
          )
        );
      }

      const tokenAmount = Math.round(parseFloat(amount) * Math.pow(10, resolvedDecimals));

      transaction.add(
        createTransferInstruction(
          fromTokenAccount,
          toTokenAccount,
          publicKey,
          tokenAmount
        )
      );
    } else {
      const lamports = Math.round(parseFloat(amount) * LAMPORTS_PER_SOL);
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipientPubKey,
          lamports: lamports,
        })
      );
    }

    const signature = await sendTransaction(transaction, connection);
    const latestBlockhash = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      signature,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    });
    return signature;
  };

  // --- EVM TRANSFER LOGIC ---
  const ensureCorrectEvmNetwork = async (eip1193Provider, browserProvider) => {
    const network = await browserProvider.getNetwork();
    if (network.chainId === BigInt(chain.chainIdDec)) return;

    setStatus(`Switching wallet to ${chain.label}...`);
    try {
      await eip1193Provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chain.chainIdHex }],
      });
    } catch (switchError) {
      // 4902 = chain not yet added to the wallet
      if (switchError && switchError.code === 4902) {
        await eip1193Provider.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: chain.chainIdHex,
              chainName: chain.label,
              nativeCurrency: chain.nativeCurrency,
              rpcUrls: chain.rpcUrls,
              blockExplorerUrls: chain.blockExplorerUrls,
            },
          ],
        });
        await eip1193Provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: chain.chainIdHex }],
        });
      } else {
        throw new Error(
          `Failed to switch to ${chain.label}. Please switch manually in your wallet.`
        );
      }
    }
  };

  const handleEVMTransfer = async () => {
    const selected = evmProviders.find((p) => p.info.rdns === selectedEvmRdns);
    // Fall back to window.ethereum only if EIP-6963 found nothing at all
    // (an older wallet that doesn't announce itself yet).
    const eip1193Provider = selected ? selected.provider : window.ethereum;

    if (!eip1193Provider) {
      throw new Error(
        "No EVM wallet found. Please install MetaMask or another injected wallet."
      );
    }
    if (evmProviders.length > 1 && !selected) {
      throw new Error("Please select which EVM wallet to use above.");
    }

    const provider = new ethers.BrowserProvider(eip1193Provider);
    await provider.send("eth_requestAccounts", []);
    await ensureCorrectEvmNetwork(eip1193Provider, provider);

    // Re-fetch the signer after a potential network switch.
    const freshProvider = new ethers.BrowserProvider(eip1193Provider);
    const signer = await freshProvider.getSigner();

    if (tokenAddress) {
      const erc20Abi = [
        "function transfer(address to, uint256 amount) returns (bool)",
      ];
      const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, signer);
      const parsedAmount = ethers.parseUnits(amount, resolvedDecimals);
      const tx = await tokenContract.transfer(recipient, parsedAmount);
      await tx.wait();
      return tx.hash;
    } else {
      const tx = await signer.sendTransaction({
        to: recipient,
        value: ethers.parseUnits(amount, chain.nativeCurrency.decimals),
      });
      await tx.wait();
      return tx.hash;
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    setStatus("Initiating transfer...");
    try {
      const txHash = isSolana
        ? await handleSolanaTransfer()
        : await handleEVMTransfer();
      setStatus(`Success! Transaction Hash: ${txHash}`);
    } catch (error) {
      console.error(error);
      setStatus(`Failed: ${error.message}`);
    }
  };

  return (
    <div className="App">
      <div className="App-header">
        <h1>Universal Token Sender</h1>

        <div style={{ marginBottom: "20px", textAlign: "left", width: "300px" }}>
          <label>
            <strong>Select Chain</strong>
          </label>
          <br />
          <select
            value={chainKey}
            onChange={(e) => setChainKey(e.target.value)}
            style={{ padding: "10px", width: "100%", marginTop: "5px" }}
          >
            {CHAIN_GROUPS.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.chains.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {isSolana ? (
          <div style={{ marginBottom: "20px" }}>
            <WalletMultiButton />
          </div>
        ) : evmProviders.length > 0 ? (
          <div style={{ marginBottom: "20px", textAlign: "left", width: "300px" }}>
            <label>
              <strong>Select EVM Wallet</strong>
            </label>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                marginTop: "8px",
              }}
            >
              {evmProviders.map(({ info }) => (
                <button
                  key={info.rdns}
                  type="button"
                  onClick={() => setSelectedEvmRdns(info.rdns)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px",
                    borderRadius: "8px",
                    border:
                      selectedEvmRdns === info.rdns
                        ? "2px solid #60a5fa"
                        : "1px solid #475569",
                    background:
                      selectedEvmRdns === info.rdns
                        ? "rgba(96, 165, 250, 0.15)"
                        : "rgba(255, 255, 255, 0.05)",
                    color: "#f8fafc",
                    margin: 0,
                  }}
                >
                  {info.icon && (
                    <img src={info.icon} alt="" style={{ width: 20, height: 20 }} />
                  )}
                  {info.name}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <p style={{ color: "#93c5fd", marginBottom: "20px" }}>
            No EVM wallet detected. Please install MetaMask or another
            injected wallet.
          </p>
        )}

        <form
          onSubmit={handleTransfer}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "15px",
            textAlign: "left",
          }}
        >
          <div>
            <label>Recipient Address</label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              required
              style={{ width: "100%", padding: "10px", boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label>Token Contract / Mint (Optional)</label>
            <input
              type="text"
              placeholder={`Leave blank for native ${
                isSolana ? "SOL" : chain.nativeCurrency.symbol
              }`}
              value={tokenAddress}
              onChange={(e) => setTokenAddress(e.target.value)}
              style={{ width: "100%", padding: "10px", boxSizing: "border-box" }}
            />
          </div>

          {tokenAddress && (
            <div>
              <label>Token Decimals</label>
              <input
                type="number"
                placeholder={String(defaultDecimals)}
                value={decimals}
                onChange={(e) => setDecimals(e.target.value)}
                style={{ width: "100%", padding: "10px", boxSizing: "border-box" }}
              />
            </div>
          )}

          <div>
            <label>Amount</label>
            <input
              type="number"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              style={{ width: "100%", padding: "10px", boxSizing: "border-box" }}
            />
          </div>

          <button
            type="submit"
            style={{
              padding: "15px",
              backgroundColor: "#000",
              color: "#fff",
              cursor: "pointer",
              border: "none",
              borderRadius: "5px",
              fontWeight: "bold",
            }}
          >
            Send Tokens
          </button>
        </form>

        {status && (
          <div
            style={{
              marginTop: "20px",
              padding: "15px",
              backgroundColor: "#f0f0f0",
              borderRadius: "5px",
              wordWrap: "break-word",
              color: "#0f172a",
            }}
          >
            {status}
          </div>
        )}
      </div>
    </div>
  );
};

export default function Component1() {
  const [chainKey, setChainKey] = useState(DEFAULT_CHAIN_KEY);
  const chain = CHAINS_BY_KEY[chainKey];

  // Only relevant while a Solana chain is selected; re-keying the
  // ConnectionProvider/WalletProvider on cluster change forces a clean
  // reconnect instead of holding a stale endpoint.
  const solanaEndpoint = useMemo(
    () => clusterApiUrl(chain.type === "solana" ? chain.cluster : "devnet"),
    [chain]
  );

  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  const handleSetChainKey = useCallback((key) => setChainKey(key), []);

  return (
    <ConnectionProvider key={solanaEndpoint} endpoint={solanaEndpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <UniversalSender chainKey={chainKey} setChainKey={handleSetChainKey} />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
