// src/Component9.js
import React, { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { Connection, PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import "./Component9.css";

const ALCHEMY_ETH_KEY  = process.env.REACT_APP_ALCHEMY_ETHEREUM_API_KEY || "";
const ALCHEMY_SOL_KEY  = process.env.REACT_APP_ALCHEMY_SOLANA_API_KEY   || "";
const ALCHEMY_POLY_KEY = process.env.REACT_APP_ALCHEMY_POLYGON_KEY      || "";
const ALCHEMY_BASE_KEY = process.env.REACT_APP_ALCHEMY_BASE_KEY         || "";

const EVM_CHAINS = [
  { id: "ethereum",    label: "Ethereum",                    symbol: "ETH",   rpc: `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_ETH_KEY}`,   keyName: "REACT_APP_ALCHEMY_ETHEREUM_API_KEY", keyValue: ALCHEMY_ETH_KEY  },
  { id: "polygon",     label: "Polygon",                     symbol: "MATIC", rpc: `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_POLY_KEY}`, keyName: "REACT_APP_ALCHEMY_POLYGON_KEY",      keyValue: ALCHEMY_POLY_KEY },
  { id: "base",        label: "Base",                        symbol: "ETH",   rpc: `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_BASE_KEY}`, keyName: "REACT_APP_ALCHEMY_BASE_KEY",         keyValue: ALCHEMY_BASE_KEY },
  { id: "sepolia",     label: "Ethereum Sepolia (testnet)",  symbol: "ETH",   rpc: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_ETH_KEY}`,   keyName: "REACT_APP_ALCHEMY_ETHEREUM_API_KEY", keyValue: ALCHEMY_ETH_KEY  },
  { id: "baseSepolia", label: "Base Sepolia (testnet)",      symbol: "ETH",   rpc: `https://base-sepolia.g.alchemy.com/v2/${ALCHEMY_BASE_KEY}`, keyName: "REACT_APP_ALCHEMY_BASE_KEY",         keyValue: ALCHEMY_BASE_KEY },
];

const SOLANA_CHAINS = [
  { id: "solana",       label: "Solana",        rpc: `https://solana-mainnet.g.alchemy.com/v2/${ALCHEMY_SOL_KEY}`, keyName: "REACT_APP_ALCHEMY_SOLANA_API_KEY", keyValue: ALCHEMY_SOL_KEY },
  { id: "solanaDevnet", label: "Solana Devnet", rpc: `https://solana-devnet.g.alchemy.com/v2/${ALCHEMY_SOL_KEY}`,  keyName: "REACT_APP_ALCHEMY_SOLANA_API_KEY", keyValue: ALCHEMY_SOL_KEY },
];
const isSolanaChain = (id) => SOLANA_CHAINS.some((c) => c.id === id);
const STORAGE_KEY      = "c9_watchlist_v2";

function requireKey(chain) {
  if (!chain.keyValue) {
    throw new Error(`Missing ${chain.keyName} — set it in your deploy environment (e.g. Netlify env vars) and redeploy, or in .env locally and restart the dev server.`);
  }
}

const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
];

function loadEntries() {
  try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : []; }
  catch { return []; }
}
function saveEntries(e) { localStorage.setItem(STORAGE_KEY, JSON.stringify(e)); }
function shortAddr(a) { if (!a || a.length <= 12) return a; return a.slice(0,6) + "…" + a.slice(-4); }
function fmt(num) {
  if (num === null || num === undefined) return "—";
  const n = parseFloat(num);
  if (isNaN(n)) return "—";
  if (n === 0) return "0";
  if (n < 0.0001) return n.toExponential(2);
  return n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 6 });
}
function nowStr() { return new Date().toLocaleTimeString(); }

async function fetchEVM(entry) {
  const chain = EVM_CHAINS.find((c) => c.id === entry.chain);
  if (!chain) throw new Error("Unknown chain: " + entry.chain);
  requireKey(chain);
  const provider = new ethers.JsonRpcProvider(chain.rpc);
  const raw      = await provider.getBalance(entry.address);
  const native   = parseFloat(ethers.formatEther(raw));
  const tokenBalances = [];
  for (const ta of entry.tokenAddresses || []) {
    try {
      const ct = new ethers.Contract(ta.address, ERC20_ABI, provider);
      const [bal, sym, dec] = await Promise.all([ct.balanceOf(entry.address), ct.symbol(), ct.decimals()]);
      tokenBalances.push({
        address: ta.address, symbol: sym, decimals: Number(dec),
        balance: parseFloat(ethers.formatUnits(bal, dec)), balanceRaw: bal.toString(),
      });
    } catch (e) {
      tokenBalances.push({ address: ta.address, symbol: "???", balance: null, balanceRaw: null, error: e.message });
    }
  }
  return { nativeBalance: native, nativeBalanceRaw: raw.toString(), nativeSymbol: chain.symbol, tokenBalances };
}

// A wallet's SPL/Token-2022 balance for a given mint doesn't live at the
// wallet's own address — it lives in a separate token account, deterministically
// derived from (mint, owner, token program). We have to derive that Associated
// Token Account address ourselves and query *it*, not just ask "what accounts
// does this owner have" and hope the first one back is the right one.
async function resolveTokenProgramId(connection, mint) {
  const info = await connection.getAccountInfo(mint);
  if (!info) throw new Error("Mint account not found on this cluster");
  return info.owner.equals(TOKEN_2022_PROGRAM_ID) ? TOKEN_2022_PROGRAM_ID : TOKEN_PROGRAM_ID;
}

async function fetchSolana(entry) {
  const chain = SOLANA_CHAINS.find((c) => c.id === entry.chain);
  if (!chain) throw new Error("Unknown chain: " + entry.chain);
  requireKey(chain);
  const connection = new Connection(chain.rpc, "confirmed");
  const pubkey     = new PublicKey(entry.address);
  const lamports   = await connection.getBalance(pubkey);
  const native     = lamports / 1e9;
  // Off-curve owners (PDAs / program-controlled vaults) need allowOwnerOffCurve
  // set, otherwise the ATA derivation throws — a normal wallet keypair is
  // on-curve and doesn't need it.
  const offCurve   = entry.offCurve === true;

  const tokenBalances = [];
  for (const ta of entry.tokenAddresses || []) {
    try {
      const mint          = new PublicKey(ta.address);
      const tokenProgramId = await resolveTokenProgramId(connection, mint);
      const ata            = await getAssociatedTokenAddress(mint, pubkey, offCurve, tokenProgramId);

      let balance = 0, balanceRaw = "0", decimals = null;
      try {
        const res  = await connection.getTokenAccountBalance(ata);
        balance    = parseFloat(res.value.uiAmountString || "0");
        balanceRaw = res.value.amount;
        decimals   = res.value.decimals;
      } catch (balErr) {
        // ATA hasn't been created on-chain yet (owner never received this
        // token) — that's a real, valid state, not a fetch failure.
        if (!/could not find account/i.test(balErr.message || "")) throw balErr;
      }

      tokenBalances.push({
        address: ta.address, ata: ata.toBase58(),
        symbol: ta.label || shortAddr(ta.address), balance, balanceRaw, decimals,
      });
    } catch (e) {
      tokenBalances.push({ address: ta.address, symbol: ta.label || shortAddr(ta.address), balance: null, balanceRaw: null, error: e.message });
    }
  }
  return { nativeBalance: native, nativeBalanceRaw: lamports.toString(), nativeSymbol: "SOL", tokenBalances };
}

const CopyIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const EditIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  </svg>
);

function useCopy() {
  const [copiedKey, setCopiedKey] = useState(null);
  const copy = useCallback((text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  }, []);
  return { copiedKey, copy };
}

function AddressCard({ entry, balanceData, onDelete, onRename, onRefresh }) {
  const { copiedKey, copy } = useCopy();
  const [editing, setEditing]     = useState(false);
  const [nameInput, setNameInput] = useState(entry.name);

  const commitRename = () => { onRename(entry.id, nameInput.trim() || shortAddr(entry.address)); setEditing(false); };

  const bd     = balanceData[entry.id];
  const isLoad = bd?.status === "loading";
  const isErr  = bd?.status === "error";
  const isOk   = bd?.status === "ok";

  return (
    <div className="c9-addr-card">
      <div className="c9-addr-top">
        {editing ? (
          <input className="c9-name-input" value={nameInput} autoFocus
            onChange={(e) => setNameInput(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => e.key === "Enter" && commitRename()} />
        ) : (
          <span className="c9-addr-name-display" onClick={() => setEditing(true)} title="Click to rename">
            {entry.name}<span className="c9-edit-icon"><EditIcon /></span>
          </span>
        )}
        <span className="c9-addr-text">{entry.address}</span>
        {entry.offCurve && <span className="c9-pda-badge" title="Owner is an off-curve / PDA address">PDA</span>}
        <button className={`c9-copy-btn ${copiedKey === "a"+entry.id ? "copied" : ""}`}
          title="Copy address" onClick={() => copy(entry.address, "a"+entry.id)}>
          {copiedKey === "a"+entry.id ? <CheckIcon /> : <CopyIcon />}
        </button>
        <button className="c9-del-btn" title="Remove" onClick={() => onDelete(entry.id)}><TrashIcon /></button>
      </div>

      {entry.offCurve && entry.authority && (
        <div className="c9-authority-row">
          <span className="c9-authority-label">Authority</span>
          <span>{entry.authority}</span>
          <button className={`c9-copy-btn ${copiedKey==="auth"+entry.id?"copied":""}`}
            title="Copy authority address" onClick={() => copy(entry.authority, "auth"+entry.id)}>
            {copiedKey==="auth"+entry.id ? <CheckIcon/> : <CopyIcon/>}
          </button>
        </div>
      )}

      {isLoad && <div className="c9-status-loading"><span className="c9-spinner" /> Fetching balances…</div>}
      {isErr  && <div className="c9-status-error">⚠ {bd.error}</div>}
      {isOk   && (
        <>
          <div className="c9-balances">
            <div className="c9-bal-chip native">
              <span className="c9-bal-label">Native</span>
              <span className="c9-bal-value">{fmt(bd.nativeBalance)}</span>
              <span className="c9-bal-symbol">{bd.nativeSymbol}</span>
              {bd.nativeBalanceRaw != null && (
                <button className={`c9-raw-btn ${copiedKey==="nraw"+entry.id?"copied":""}`}
                  title={"Copy raw value (smallest unit) for contract calls:\n"+bd.nativeBalanceRaw}
                  onClick={() => copy(bd.nativeBalanceRaw, "nraw"+entry.id)}>
                  {copiedKey==="nraw"+entry.id ? <CheckIcon/> : <>RAW<CopyIcon/></>}
                </button>
              )}
            </div>
            {(bd.tokenBalances || []).map((tb, i) => (
              <div className="c9-bal-chip token" key={i}>
                <span className="c9-bal-label">Token</span>
                <span className="c9-bal-value">{fmt(tb.balance)}</span>
                <span className="c9-bal-symbol">{tb.symbol}</span>
                {tb.balanceRaw != null && (
                  <button className={`c9-raw-btn ${copiedKey==="traw"+i+entry.id?"copied":""}`}
                    title={"Copy raw value (smallest unit) for contract calls:\n"+tb.balanceRaw}
                    onClick={() => copy(tb.balanceRaw, "traw"+i+entry.id)}>
                    {copiedKey==="traw"+i+entry.id ? <CheckIcon/> : <>RAW<CopyIcon/></>}
                  </button>
                )}
                <button className={`c9-copy-btn ${copiedKey==="t"+i+entry.id?"copied":""}`}
                  title={"Copy contract address: "+tb.address} onClick={() => copy(tb.address,"t"+i+entry.id)} style={{marginLeft:2}}>
                  {copiedKey==="t"+i+entry.id ? <CheckIcon/> : <CopyIcon/>}
                </button>
              </div>
            ))}
          </div>
          <div className="c9-last-updated">
            Last updated: {bd.updatedAt}
            <button className="c9-refresh-btn" onClick={() => onRefresh(entry.id)}>↻ Refresh</button>
          </div>
        </>
      )}
      {!bd && <div className="c9-status-loading" style={{color:"#444"}}>Waiting for first fetch…</div>}

      {(entry.tokenAddresses||[]).length > 0 && (
        <div className="c9-token-addr-list">
          {entry.tokenAddresses.map((ta, i) => {
            const tb = bd?.tokenBalances?.[i];
            return (
              <div className="c9-token-addr-row" key={i}>
                <span style={{color:"#444"}}>├</span>
                <span style={{color:"#666"}}>{ta.label || shortAddr(ta.address)}</span>
                <span>{ta.address}</span>
                <button className={`c9-copy-btn ${copiedKey==="ta"+i+entry.id?"copied":""}`}
                  title="Copy mint address" onClick={() => copy(ta.address,"ta"+i+entry.id)}>
                  {copiedKey==="ta"+i+entry.id ? <CheckIcon/> : <CopyIcon/>}
                </button>
                {tb?.ata && (
                  <>
                    <span style={{color:"#444"}}>ATA:</span>
                    <span style={{color:"#888"}}>{tb.ata}</span>
                    <button className={`c9-copy-btn ${copiedKey==="ata"+i+entry.id?"copied":""}`}
                      title="Copy Associated Token Account address" onClick={() => copy(tb.ata,"ata"+i+entry.id)}>
                      {copiedKey==="ata"+i+entry.id ? <CheckIcon/> : <CopyIcon/>}
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const Component9 = () => {
  const [entries,     setEntries]     = useState(() => loadEntries());
  const [balanceData, setBalanceData] = useState({});
  const [addrInput,   setAddrInput]   = useState("");
  const [nameInput,   setNameInput]   = useState("");
  const [chainInput,  setChainInput]  = useState("ethereum");
  const [tokenInput,  setTokenInput]  = useState("");
  const [pdaToggle,     setPdaToggle]     = useState(false);
  const [authorityInput, setAuthorityInput] = useState("");
  const [addError,    setAddError]    = useState("");

  useEffect(() => { saveEntries(entries); }, [entries]);

  const fetchEntry = useCallback(async (entry) => {
    setBalanceData((prev) => ({ ...prev, [entry.id]: { ...prev[entry.id], status: "loading" } }));
    try {
      const data = isSolanaChain(entry.chain) ? await fetchSolana(entry) : await fetchEVM(entry);
      setBalanceData((prev) => ({ ...prev, [entry.id]: { ...data, status: "ok", updatedAt: nowStr() } }));
    } catch (e) {
      setBalanceData((prev) => ({ ...prev, [entry.id]: { status: "error", error: e.message } }));
    }
  }, []);

  const fetchAll = useCallback((list) => { list.forEach((e) => fetchEntry(e)); }, [fetchEntry]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (entries.length > 0) fetchAll(entries); }, []);

  const handleAdd = () => {
    setAddError("");
    const addr = addrInput.trim();
    if (!addr) return setAddError("Address cannot be empty.");
    if (isSolanaChain(chainInput)) {
      try { new PublicKey(addr); } catch { return setAddError("Invalid Solana address."); }
    } else {
      if (!ethers.isAddress(addr)) return setAddError("Invalid EVM address.");
    }
    const tokenAddresses = tokenInput.split(",").map((s) => s.trim()).filter(Boolean).map((s) => ({ address: s }));
    const newEntry = {
      id: Date.now().toString(), address: addr, name: nameInput.trim() || shortAddr(addr), chain: chainInput, tokenAddresses,
      ...(isSolanaChain(chainInput) ? { offCurve: pdaToggle, authority: authorityInput.trim() || undefined } : {}),
    };
    setEntries((prev) => [...prev, newEntry]);
    setAddrInput(""); setNameInput(""); setTokenInput(""); setPdaToggle(false); setAuthorityInput("");
    fetchEntry(newEntry);
  };

  const handleDelete = (id) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setBalanceData((prev) => { const c = { ...prev }; delete c[id]; return c; });
  };

  const handleRename  = (id, name) => setEntries((prev) => prev.map((e) => e.id === id ? { ...e, name } : e));
  const handleRefresh = (id) => { const e = entries.find((x) => x.id === id); if (e) fetchEntry(e); };

  const solByChain = SOLANA_CHAINS.reduce((acc, c) => { acc[c.id] = entries.filter((e) => e.chain === c.id); return acc; }, {});
  const evmByChain = EVM_CHAINS.reduce((acc, c) => { acc[c.id] = entries.filter((e) => e.chain === c.id); return acc; }, {});

  return (
    <div className="c9-wrapper">
      <h2 className="c9-title">🔭 Token Watcher</h2>
      <p className="c9-subtitle">Track native + token balances for EVM addresses and Solana wallets. Persists forever · Fetches once on load, use ↻ Refresh to update.</p>

      <div className="c9-add-card">
        <p className="c9-add-title">+ Add Address to Watch</p>
        <div className="c9-add-row">
          <div className="c9-add-group" style={{maxWidth:180}}>
            <label>Chain</label>
            <select className="c9-select" value={chainInput} onChange={(e) => setChainInput(e.target.value)}>
              {EVM_CHAINS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              {SOLANA_CHAINS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
          <div className="c9-add-group" style={{flex:2,minWidth:260}}>
            <label>{isSolanaChain(chainInput) ? "Wallet Address (Pubkey)" : "EVM Wallet Address"}</label>
            <input className="c9-input" placeholder={isSolanaChain(chainInput)?"Solana pubkey…":"0x…"}
              value={addrInput} onChange={(e) => setAddrInput(e.target.value)} />
          </div>
          <div className="c9-add-group" style={{maxWidth:180}}>
            <label>Label (optional)</label>
            <input className="c9-input" placeholder="e.g. My Wallet" value={nameInput} onChange={(e) => setNameInput(e.target.value)} />
          </div>
          <div className="c9-add-group" style={{flex:2,minWidth:220}}>
            <label>{isSolanaChain(chainInput)?"Mint address(es)":"Token contract(s)"}{" "}
              <span style={{color:"#555",fontWeight:400,textTransform:"none"}}>(comma-separated, optional)</span>
            </label>
            <input className="c9-input"
              placeholder={isSolanaChain(chainInput)?"MintPubkey1, MintPubkey2…":"0xTokenA, 0xTokenB…"}
              value={tokenInput} onChange={(e) => setTokenInput(e.target.value)} />
          </div>
          <button className="c9-btn-add" onClick={handleAdd}>Add</button>
        </div>

        {isSolanaChain(chainInput) && (
          <div className="c9-pda-row">
            <label className="c9-checkbox-label">
              <input type="checkbox" checked={pdaToggle} onChange={(e) => setPdaToggle(e.target.checked)} />
              Owner is a PDA / off-curve (program-controlled) address
            </label>
            {pdaToggle && (
              <div className="c9-add-group" style={{flex:2, minWidth:260, marginTop:8}}>
                <label>Authority (optional, for your reference)</label>
                <input className="c9-input" placeholder="Pubkey with signing authority over this PDA…"
                  value={authorityInput} onChange={(e) => setAuthorityInput(e.target.value)} />
              </div>
            )}
          </div>
        )}

        {addError && <div className="c9-error-msg">⚠ {addError}</div>}
      </div>

      {EVM_CHAINS.map((c) => {
        const list = evmByChain[c.id] || [];
        if (!list.length) return null;
        return (
          <div className="c9-section" key={c.id}>
            <div className="c9-section-header">
              <span className="c9-chain-badge eth">{c.label.toUpperCase()}</span>
              <span className="c9-section-label">{c.label} Addresses</span>
              <span className="c9-count-chip">{list.length}</span>
            </div>
            <div className="c9-cards-grid">
              {list.map((entry) => (
                <AddressCard key={entry.id} entry={entry} balanceData={balanceData}
                  onDelete={handleDelete} onRename={handleRename} onRefresh={handleRefresh} />
              ))}
            </div>
          </div>
        );
      })}

      {SOLANA_CHAINS.map((c) => {
        const list = solByChain[c.id] || [];
        if (!list.length) return null;
        return (
          <div className="c9-section" key={c.id}>
            <div className="c9-section-header">
              <span className="c9-chain-badge sol">{c.label.toUpperCase()}</span>
              <span className="c9-section-label">{c.label} Addresses</span>
              <span className="c9-count-chip">{list.length}</span>
            </div>
            <div className="c9-cards-grid">
              {list.map((entry) => (
                <AddressCard key={entry.id} entry={entry} balanceData={balanceData}
                  onDelete={handleDelete} onRename={handleRename} onRefresh={handleRefresh} />
              ))}
            </div>
          </div>
        );
      })}

      {entries.length === 0 && (
        <div className="c9-empty-state">No addresses added yet. Use the form above to start tracking.</div>
      )}
    </div>
  );
};

export default Component9;
