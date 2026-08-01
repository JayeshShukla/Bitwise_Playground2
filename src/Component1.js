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
  TransactionInstruction,
  SYSVAR_RENT_PUBKEY,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  createAssociatedTokenAccountInstruction,
  getAccount,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import "@solana/wallet-adapter-react-ui/styles.css";

import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";

// Anchor Imports — only used to encode instruction data (discriminator +
// Borsh-serialized args) from a pasted IDL. Requires `@coral-xyz/anchor`
// as a dependency (`npm install @coral-xyz/anchor`); its BorshInstructionCoder
// supports both the legacy IDL shape (isMut/isSigner, sighash discriminator)
// and the >=0.30 shape (writable/signer, embedded discriminator).
import { BorshInstructionCoder, BN } from "@coral-xyz/anchor";

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

// --- Generic ABI param parsing ------------------------------------------
// Turns whatever the user typed into a value ethers can encode for a given
// Solidity type. Deliberately permissive (this is a debug/ops tool, not a
// form with strict UX) — numeric strings are left as strings/handled by
// ethers itself, arrays/tuples accept either JSON or comma-separated text.
function parseAbiParamValue(type, rawValue) {
  const value = typeof rawValue === "string" ? rawValue.trim() : rawValue;

  if (type.endsWith("[]")) {
    const elementType = type.slice(0, -2);
    if (value === "" || value === undefined) return [];
    let items;
    try {
      const parsed = JSON.parse(value);
      if (!Array.isArray(parsed)) throw new Error("not an array");
      items = parsed;
    } catch {
      items = value.split(",").map((v) => v.trim());
    }
    return items.map((item) => parseAbiParamValue(elementType, item));
  }

  if (type.startsWith("tuple")) {
    if (value === "" || value === undefined) {
      throw new Error(`Tuple parameter requires JSON input, e.g. ["0xabc...", 123]`);
    }
    return JSON.parse(value);
  }

  if (type === "bool") {
    if (typeof value === "boolean") return value;
    return value === "true" || value === "1";
  }

  // uint*, int*, address, bytes*, string: pass the trimmed string straight
  // through — ethers parses numeric strings into BigInt for uint/int itself.
  return value;
}

function stringifyResult(value) {
  return JSON.stringify(
    value,
    (_key, v) => (typeof v === "bigint" ? v.toString() : v),
    2
  );
}

const inputStyle = { width: "100%", padding: "10px", boxSizing: "border-box" };
const cardStyle = {
  marginTop: 40,
  paddingTop: 24,
  borderTop: "1px solid #475569",
  textAlign: "left",
};

// --- Generic "call any contract function" panel (EVM only) -------------
// Paste an address + ABI, pick a function, fill in its args. View/pure
// functions are called as reads; everything else is sent as a transaction
// through whichever EVM wallet is currently selected above.
function ContractInteraction({ chain, evmProviders, selectedEvmRdns, ensureCorrectEvmNetwork }) {
  const [contractAddress, setContractAddress] = useState("");
  const [abiJson, setAbiJson] = useState("");
  const [selectedSignature, setSelectedSignature] = useState("");
  const [functionArgs, setFunctionArgs] = useState([]);
  const [payableValue, setPayableValue] = useState("");
  const [status, setStatus] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { parsedAbi, abiError } = useMemo(() => {
    if (!abiJson.trim()) return { parsedAbi: null, abiError: "" };
    try {
      const parsed = JSON.parse(abiJson);
      // Accept either a raw ABI array, or an Etherscan-style `{ "abi": [...] }` blob.
      const abi = Array.isArray(parsed) ? parsed : parsed.abi;
      if (!Array.isArray(abi)) throw new Error("No ABI array found in JSON");
      return { parsedAbi: abi, abiError: "" };
    } catch (e) {
      return { parsedAbi: null, abiError: `Invalid ABI JSON: ${e.message}` };
    }
  }, [abiJson]);

  const contractFunctions = useMemo(() => {
    if (!parsedAbi) return [];
    return parsedAbi
      .filter((item) => item.type === "function")
      .map((item) => ({
        ...item,
        inputs: item.inputs || [],
        signature: `${item.name}(${(item.inputs || []).map((inp) => inp.type).join(",")})`,
      }));
  }, [parsedAbi]);

  // Keep the selected function valid whenever the ABI changes.
  useEffect(() => {
    if (contractFunctions.length === 0) {
      setSelectedSignature("");
      return;
    }
    if (!contractFunctions.some((f) => f.signature === selectedSignature)) {
      setSelectedSignature(contractFunctions[0].signature);
    }
  }, [contractFunctions, selectedSignature]);

  const selectedFunction = contractFunctions.find((f) => f.signature === selectedSignature);

  // Reset the arg inputs whenever the selected function changes shape.
  useEffect(() => {
    setFunctionArgs(selectedFunction ? selectedFunction.inputs.map(() => "") : []);
    setPayableValue("");
    setResult("");
  }, [selectedFunction]);

  const isRead = selectedFunction && (selectedFunction.stateMutability === "view" || selectedFunction.stateMutability === "pure");
  const isPayable = selectedFunction && selectedFunction.stateMutability === "payable";

  const handleArgChange = (index, value) => {
    setFunctionArgs((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleCall = async (e) => {
    e.preventDefault();
    if (!selectedFunction) return;

    setResult("");
    setIsLoading(true);
    setStatus(isRead ? "Reading..." : "Preparing transaction...");

    try {
      if (!ethers.isAddress(contractAddress.trim())) {
        throw new Error("Enter a valid contract address.");
      }

      const selected = evmProviders.find((p) => p.info.rdns === selectedEvmRdns);
      const eip1193Provider = selected ? selected.provider : window.ethereum;
      if (!eip1193Provider) {
        throw new Error("No EVM wallet found. Please install MetaMask or another injected wallet.");
      }
      if (evmProviders.length > 1 && !selected) {
        throw new Error("Please select which EVM wallet to use above.");
      }

      const browserProvider = new ethers.BrowserProvider(eip1193Provider);
      await browserProvider.send("eth_requestAccounts", []);
      await ensureCorrectEvmNetwork(eip1193Provider, browserProvider);

      // Re-fetch the signer after a potential network switch.
      const freshProvider = new ethers.BrowserProvider(eip1193Provider);
      const signer = await freshProvider.getSigner();

      const contract = new ethers.Contract(contractAddress.trim(), parsedAbi, signer);
      const args = selectedFunction.inputs.map((input, i) =>
        parseAbiParamValue(input.type, functionArgs[i])
      );

      const overrides = {};
      if (isPayable && payableValue) {
        overrides.value = ethers.parseUnits(payableValue, chain.nativeCurrency.decimals);
      }

      const fn = contract.getFunction(selectedFunction.signature);

      if (isRead) {
        const value = await fn(...args, ...(Object.keys(overrides).length ? [overrides] : []));
        setResult(stringifyResult(value));
        setStatus("Read complete.");
      } else {
        const tx = await fn(...args, overrides);
        setStatus(`Transaction sent: ${tx.hash} — waiting for confirmation...`);
        const receipt = await tx.wait();
        setResult(stringifyResult(receipt));
        setStatus(`Confirmed in block ${receipt.blockNumber}.`);
      }
    } catch (error) {
      console.error(error);
      setStatus(`Failed: ${error.reason || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={cardStyle}>
      <h2 style={{ marginBottom: 4 }}>Call Any Contract Function</h2>
      <p style={{ color: "#93c5fd", marginTop: 0, fontSize: 14 }}>
        EVM only — paste a contract address and its ABI, pick a function, fill in the
        arguments. View/pure functions are read directly; everything else is sent as a
        transaction from the EVM wallet selected above, on {chain.label}.
      </p>

      <div style={{ marginBottom: 15 }}>
        <label>Contract Address</label>
        <input
          type="text"
          placeholder="0x..."
          value={contractAddress}
          onChange={(e) => setContractAddress(e.target.value)}
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: 15 }}>
        <label>Contract ABI (JSON array, or an Etherscan-style {"{ \"abi\": [...] }"} blob)</label>
        <textarea
          rows={6}
          placeholder='[{"type":"function","name":"transfer","inputs":[...],"stateMutability":"nonpayable",...}]'
          value={abiJson}
          onChange={(e) => setAbiJson(e.target.value)}
          style={{ ...inputStyle, fontFamily: "monospace", fontSize: 12 }}
        />
        {abiError && <div style={{ color: "#f87171", fontSize: 13, marginTop: 4 }}>{abiError}</div>}
      </div>

      {contractFunctions.length > 0 && (
        <>
          <div style={{ marginBottom: 15 }}>
            <label>Function</label>
            <select
              value={selectedSignature}
              onChange={(e) => setSelectedSignature(e.target.value)}
              style={inputStyle}
            >
              {contractFunctions.map((f) => (
                <option key={f.signature} value={f.signature}>
                  {f.signature} ({f.stateMutability})
                </option>
              ))}
            </select>
          </div>

          <form onSubmit={handleCall} style={{ display: "flex", flexDirection: "column", gap: 15 }}>
            {selectedFunction &&
              selectedFunction.inputs.map((input, i) => (
                <div key={`${selectedFunction.signature}-${i}`}>
                  <label>
                    {input.name || `arg${i}`} <span style={{ color: "#93c5fd" }}>({input.type})</span>
                  </label>
                  <input
                    type="text"
                    placeholder={
                      input.type.endsWith("[]")
                        ? "comma-separated, or JSON array"
                        : input.type.startsWith("tuple")
                        ? "JSON array/object matching the tuple"
                        : input.type
                    }
                    value={functionArgs[i] ?? ""}
                    onChange={(e) => handleArgChange(i, e.target.value)}
                    style={inputStyle}
                  />
                </div>
              ))}

            {isPayable && (
              <div>
                <label>Value to send ({chain.nativeCurrency.symbol})</label>
                <input
                  type="text"
                  placeholder="0.0"
                  value={payableValue}
                  onChange={(e) => setPayableValue(e.target.value)}
                  style={inputStyle}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !selectedFunction}
              style={{
                padding: "15px",
                backgroundColor: isRead ? "#1d4ed8" : "#000",
                color: "#fff",
                cursor: isLoading ? "not-allowed" : "pointer",
                opacity: isLoading ? 0.6 : 1,
                border: "none",
                borderRadius: "5px",
                fontWeight: "bold",
              }}
            >
              {isLoading ? "Working..." : isRead ? "Read" : "Write (Send Transaction)"}
            </button>
          </form>
        </>
      )}

      {status && (
        <div
          style={{
            marginTop: 20,
            padding: 15,
            backgroundColor: "#f0f0f0",
            borderRadius: 5,
            wordWrap: "break-word",
            color: "#0f172a",
          }}
        >
          {status}
        </div>
      )}

      {result && (
        <pre
          style={{
            marginTop: 12,
            padding: 15,
            backgroundColor: "#0f172a",
            color: "#e2e8f0",
            borderRadius: 5,
            overflowX: "auto",
            fontSize: 12,
          }}
        >
          {result}
        </pre>
      )}
    </div>
  );
}

// --- Generic Anchor arg parsing ------------------------------------------
// Mirrors parseAbiParamValue, but for Borsh/Anchor types. IDL `type` fields
// are either a primitive string ("u64", "publicKey", ...) or a wrapper
// object ({vec:T}, {option:T}, {array:[T,size]}, {defined:...}). Defined
// (struct/enum) types fall back to raw JSON — no recursive field-by-field
// form, same tradeoff as the EVM "tuple" case above.
function parseAnchorArgValue(type, rawValue) {
  const value = typeof rawValue === "string" ? rawValue.trim() : rawValue;

  if (type && typeof type === "object") {
    if (type.vec !== undefined) {
      const items = value === "" || value === undefined ? [] : JSON.parse(value);
      return items.map((item) => parseAnchorArgValue(type.vec, item));
    }
    if (type.option !== undefined) {
      return value === "" || value === undefined ? null : parseAnchorArgValue(type.option, value);
    }
    if (type.array !== undefined) {
      const items = JSON.parse(value);
      return items.map((item) => parseAnchorArgValue(type.array[0], item));
    }
    // `defined` (struct/enum) types: user hands us JSON matching the shape.
    return JSON.parse(value);
  }

  switch (type) {
    case "publicKey":
    case "pubkey":
      return new PublicKey(value);
    case "bool":
      return value === "true" || value === true;
    case "u8":
    case "u16":
    case "u32":
    case "i8":
    case "i16":
    case "i32":
      return Number(value);
    case "u64":
    case "i64":
    case "u128":
    case "i128":
    case "u256":
    case "i256":
      return new BN(value);
    case "bytes":
      return Buffer.from(JSON.parse(value));
    case "string":
    default:
      return value;
  }
}

function anchorTypeLabel(type) {
  if (typeof type === "string") return type;
  if (!type || typeof type !== "object") return String(type);
  if (type.vec !== undefined) return `vec<${anchorTypeLabel(type.vec)}>`;
  if (type.option !== undefined) return `option<${anchorTypeLabel(type.option)}>`;
  if (type.array !== undefined) return `array<${anchorTypeLabel(type.array[0])}, ${type.array[1]}>`;
  if (type.defined !== undefined) {
    return `defined<${typeof type.defined === "string" ? type.defined : type.defined.name}>`;
  }
  return JSON.stringify(type);
}

// IDL account entries use isMut/isSigner (legacy) or writable/signer (>=0.30).
function normalizeAnchorAccount(acc) {
  return {
    name: acc.name,
    isSigner: acc.isSigner ?? acc.signer ?? false,
    isWritable: acc.isMut ?? acc.writable ?? false,
  };
}

// Best-effort defaults for well-known account names, so the common case
// (system program, token program, the connected wallet as payer/authority)
// doesn't need to be typed in by hand every time.
function defaultAnchorAccountValue(name, walletPublicKey) {
  const key = name.toLowerCase().replace(/_/g, "");
  if (key === "systemprogram") return SystemProgram.programId.toBase58();
  if (key === "tokenprogram") return TOKEN_PROGRAM_ID.toBase58();
  if (key === "associatedtokenprogram") return ASSOCIATED_TOKEN_PROGRAM_ID.toBase58();
  if (key === "rent" || key === "rentsysvar") return SYSVAR_RENT_PUBKEY.toBase58();
  if (walletPublicKey && (key.includes("payer") || key.includes("signer") || key === "authority" || key === "user" || key === "owner")) {
    return walletPublicKey.toBase58();
  }
  return "";
}

// --- Generic "call any instruction" panel (Solana / Anchor only) -------
// Paste a program ID + Anchor IDL, pick an instruction, fill in its args
// and accounts. Every account marked as a signer other than the connected
// wallet will fail to sign — this tool can't hold extra keypairs, only the
// wallet-adapter wallet.
function SolanaProgramInteraction({ connection, publicKey, sendTransaction }) {
  const [programIdInput, setProgramIdInput] = useState("");
  const [idlJson, setIdlJson] = useState("");
  const [selectedIxName, setSelectedIxName] = useState("");
  const [argValues, setArgValues] = useState([]);
  const [accountValues, setAccountValues] = useState([]);
  const [status, setStatus] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { idl, idlError } = useMemo(() => {
    if (!idlJson.trim()) return { idl: null, idlError: "" };
    try {
      const parsed = JSON.parse(idlJson);
      if (!Array.isArray(parsed.instructions)) {
        throw new Error("No `instructions` array found — is this a valid Anchor IDL?");
      }
      return { idl: parsed, idlError: "" };
    } catch (e) {
      return { idl: null, idlError: `Invalid IDL JSON: ${e.message}` };
    }
  }, [idlJson]);

  // Anchor IDLs (>=0.30) embed the program address; auto-fill it once.
  useEffect(() => {
    if (idl?.address && !programIdInput) {
      setProgramIdInput(idl.address);
    }
  }, [idl, programIdInput]);

  const instructions = useMemo(() => idl?.instructions ?? [], [idl]);

  // Keep the selected instruction valid whenever the IDL changes.
  useEffect(() => {
    if (instructions.length === 0) {
      setSelectedIxName("");
      return;
    }
    if (!instructions.some((ix) => ix.name === selectedIxName)) {
      setSelectedIxName(instructions[0].name);
    }
  }, [instructions, selectedIxName]);

  const selectedIx = instructions.find((ix) => ix.name === selectedIxName);
  const selectedAccounts = useMemo(
    () => (selectedIx ? selectedIx.accounts.map(normalizeAnchorAccount) : []),
    [selectedIx]
  );

  // Reset args/accounts whenever the selected instruction changes shape.
  useEffect(() => {
    setArgValues(selectedIx ? selectedIx.args.map(() => "") : []);
    setAccountValues(selectedAccounts.map((acc) => defaultAnchorAccountValue(acc.name, publicKey)));
    setResult("");
  }, [selectedIx, selectedAccounts, publicKey]);

  const handleArgChange = (index, value) => {
    setArgValues((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleAccountChange = (index, value) => {
    setAccountValues((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const buildTransaction = () => {
    if (!publicKey) throw new Error("Connect a Solana wallet first.");
    if (!idl) throw new Error("Paste a valid Anchor IDL first.");
    if (!selectedIx) throw new Error("Select an instruction.");
    if (!programIdInput.trim()) throw new Error("Enter the program ID.");

    const programId = new PublicKey(programIdInput.trim());
    const coder = new BorshInstructionCoder(idl);

    const argsObject = {};
    selectedIx.args.forEach((arg, i) => {
      argsObject[arg.name] = parseAnchorArgValue(arg.type, argValues[i]);
    });
    const data = coder.encode(selectedIx.name, argsObject);

    const keys = selectedAccounts.map((acc, i) => {
      const raw = (accountValues[i] || "").trim();
      if (!raw) throw new Error(`Missing address for account "${acc.name}".`);
      return {
        pubkey: new PublicKey(raw),
        isSigner: acc.isSigner,
        isWritable: acc.isWritable,
      };
    });

    const instruction = new TransactionInstruction({ keys, programId, data });
    const transaction = new Transaction().add(instruction);
    transaction.feePayer = publicKey;
    return transaction;
  };

  const handleSimulate = async (e) => {
    e.preventDefault();
    setResult("");
    setIsLoading(true);
    setStatus("Simulating...");
    try {
      const transaction = buildTransaction();
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      const sim = await connection.simulateTransaction(transaction);
      setResult(stringifyResult(sim.value));
      setStatus(sim.value.err ? `Simulation failed: ${JSON.stringify(sim.value.err)}` : "Simulation succeeded — see logs below.");
    } catch (error) {
      console.error(error);
      setStatus(`Failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setResult("");
    setIsLoading(true);
    setStatus("Sending transaction...");
    try {
      const transaction = buildTransaction();
      const signature = await sendTransaction(transaction, connection);
      setStatus(`Transaction sent: ${signature} — confirming...`);
      const latestBlockhash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        signature,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      });
      setResult(signature);
      setStatus(`Confirmed: ${signature}`);
    } catch (error) {
      console.error(error);
      setStatus(`Failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={cardStyle}>
      <h2 style={{ marginBottom: 4 }}>Call Any Program Instruction</h2>
      <p style={{ color: "#93c5fd", marginTop: 0, fontSize: 14 }}>
        Solana / Anchor only — paste a program ID and its IDL, pick an instruction, fill
        in the args and accounts. Only the connected wallet can sign; any other account
        marked as a signer will make the transaction fail (this tool can't hold extra
        keypairs).
      </p>

      <div style={{ marginBottom: 15 }}>
        <label>Program ID</label>
        <input
          type="text"
          placeholder="Program public key"
          value={programIdInput}
          onChange={(e) => setProgramIdInput(e.target.value)}
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: 15 }}>
        <label>Anchor IDL (JSON)</label>
        <textarea
          rows={6}
          placeholder='{"instructions":[{"name":"buyTicket","accounts":[...],"args":[...]}], ...}'
          value={idlJson}
          onChange={(e) => setIdlJson(e.target.value)}
          style={{ ...inputStyle, fontFamily: "monospace", fontSize: 12 }}
        />
        {idlError && <div style={{ color: "#f87171", fontSize: 13, marginTop: 4 }}>{idlError}</div>}
      </div>

      {instructions.length > 0 && (
        <>
          <div style={{ marginBottom: 15 }}>
            <label>Instruction</label>
            <select
              value={selectedIxName}
              onChange={(e) => setSelectedIxName(e.target.value)}
              style={inputStyle}
            >
              {instructions.map((ix) => (
                <option key={ix.name} value={ix.name}>
                  {ix.name} ({ix.args.length} args, {ix.accounts.length} accounts)
                </option>
              ))}
            </select>
          </div>

          <form style={{ display: "flex", flexDirection: "column", gap: 15 }}>
            {selectedAccounts.length > 0 && (
              <div>
                <label>
                  <strong>Accounts</strong>
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
                  {selectedAccounts.map((acc, i) => (
                    <div key={`${selectedIxName}-acc-${i}`}>
                      <label>
                        {acc.name}{" "}
                        <span style={{ color: "#93c5fd" }}>
                          ({acc.isSigner ? "signer" : "non-signer"}, {acc.isWritable ? "writable" : "readonly"})
                        </span>
                      </label>
                      <input
                        type="text"
                        placeholder="Account public key"
                        value={accountValues[i] ?? ""}
                        onChange={(e) => handleAccountChange(i, e.target.value)}
                        style={inputStyle}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedIx &&
              selectedIx.args.map((arg, i) => (
                <div key={`${selectedIxName}-arg-${i}`}>
                  <label>
                    {arg.name} <span style={{ color: "#93c5fd" }}>({anchorTypeLabel(arg.type)})</span>
                  </label>
                  <input
                    type="text"
                    placeholder={anchorTypeLabel(arg.type)}
                    value={argValues[i] ?? ""}
                    onChange={(e) => handleArgChange(i, e.target.value)}
                    style={inputStyle}
                  />
                </div>
              ))}

            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                disabled={isLoading || !selectedIx}
                onClick={handleSimulate}
                style={{
                  flex: 1,
                  padding: "15px",
                  backgroundColor: "#1d4ed8",
                  color: "#fff",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  opacity: isLoading ? 0.6 : 1,
                  border: "none",
                  borderRadius: "5px",
                  fontWeight: "bold",
                }}
              >
                {isLoading ? "Working..." : "Simulate"}
              </button>
              <button
                type="button"
                disabled={isLoading || !selectedIx}
                onClick={handleSend}
                style={{
                  flex: 1,
                  padding: "15px",
                  backgroundColor: "#000",
                  color: "#fff",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  opacity: isLoading ? 0.6 : 1,
                  border: "none",
                  borderRadius: "5px",
                  fontWeight: "bold",
                }}
              >
                {isLoading ? "Working..." : "Send Transaction"}
              </button>
            </div>
          </form>
        </>
      )}

      {status && (
        <div
          style={{
            marginTop: 20,
            padding: 15,
            backgroundColor: "#f0f0f0",
            borderRadius: 5,
            wordWrap: "break-word",
            color: "#0f172a",
          }}
        >
          {status}
        </div>
      )}

      {result && (
        <pre
          style={{
            marginTop: 12,
            padding: 15,
            backgroundColor: "#0f172a",
            color: "#e2e8f0",
            borderRadius: 5,
            overflowX: "auto",
            fontSize: 12,
          }}
        >
          {result}
        </pre>
      )}
    </div>
  );
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

        {!isSolana && (
          <ContractInteraction
            chain={chain}
            evmProviders={evmProviders}
            selectedEvmRdns={selectedEvmRdns}
            ensureCorrectEvmNetwork={ensureCorrectEvmNetwork}
          />
        )}

        {isSolana && (
          <SolanaProgramInteraction
            connection={connection}
            publicKey={publicKey}
            sendTransaction={sendTransaction}
          />
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
