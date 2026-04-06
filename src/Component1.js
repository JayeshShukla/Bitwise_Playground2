import React, { useState, useMemo } from "react";
import { Buffer } from "buffer";
import "./styles.css";

// Solana Imports
import {
  ConnectionProvider,
  WalletProvider,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
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

// CRITICAL POLYFILL: This prevents Solana web3 from crashing in CodeSandbox
window.Buffer = window.Buffer || Buffer;

const UniversalSender = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const [chain, setChain] = useState("solana-devnet");
  const [recipient, setRecipient] = useState("");
  const [tokenAddress, setTokenAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");

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

      const tokenAmount = parseFloat(amount) * Math.pow(10, 6);

      transaction.add(
        createTransferInstruction(
          fromTokenAccount,
          toTokenAccount,
          publicKey,
          tokenAmount
        )
      );
    } else {
      const lamports = parseFloat(amount) * LAMPORTS_PER_SOL;
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
  const handleEVMTransfer = async () => {
    if (!window.ethereum) throw new Error("Please install MetaMask.");

    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();

    const network = await provider.getNetwork();
    if (network.chainId !== 11155111n) {
      setStatus("Switching MetaMask to Sepolia Testnet...");
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0xaa36a7" }],
        });
      } catch (switchError) {
        throw new Error(
          "Failed to switch to Sepolia Devnet. Please switch manually in MetaMask."
        );
      }
    }

    if (tokenAddress) {
      const erc20Abi = [
        "function transfer(address to, uint256 amount) returns (bool)",
      ];
      const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, signer);
      const parsedAmount = ethers.parseUnits(amount, 18);
      const tx = await tokenContract.transfer(recipient, parsedAmount);
      await tx.wait();
      return tx.hash;
    } else {
      const tx = await signer.sendTransaction({
        to: recipient,
        value: ethers.parseEther(amount),
      });
      await tx.wait();
      return tx.hash;
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    setStatus("Initiating transfer...");
    try {
      let txHash = "";
      if (chain === "solana-devnet") {
        txHash = await handleSolanaTransfer();
      } else if (chain === "evm-sepolia") {
        txHash = await handleEVMTransfer();
      }
      setStatus(`Success! Transaction Hash: ${txHash}`);
    } catch (error) {
      console.error(error);
      setStatus(`Failed: ${error.message}`);
    }
  };

  return (
    <div className="App" style={{ maxWidth: "500px", margin: "50px auto" }}>
      <h2>Universal Token Sender</h2>

      <div style={{ marginBottom: "20px", textAlign: "left" }}>
        <label>
          <strong>Select Chain:</strong>
        </label>
        <br />
        <select
          value={chain}
          onChange={(e) => setChain(e.target.value)}
          style={{ padding: "10px", width: "100%", marginTop: "5px" }}
        >
          <option value="solana-devnet">Solana (Devnet)</option>
          <option value="evm-sepolia">Ethereum (Sepolia Devnet)</option>
        </select>
      </div>

      {chain === "solana-devnet" && (
        <div style={{ marginBottom: "20px" }}>
          <WalletMultiButton />
        </div>
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
            placeholder="Leave blank for Native SOL / ETH"
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            style={{ width: "100%", padding: "10px", boxSizing: "border-box" }}
          />
        </div>

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
          }}
        >
          {status}
        </div>
      )}
    </div>
  );
};

// Renamed to Component1 per your request
export default function Component1() {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <UniversalSender />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
