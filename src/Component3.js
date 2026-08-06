import React, { useState, useEffect, useMemo } from "react";
import { ethers } from "ethers";
import "./Component3.css";
import config from "./config";

const Component3 = () => {
  const [contractAddress, setContractAddress] = useState("");
  const [isValidAddress, setIsValidAddress] = useState(true);
  const [slotType, setSlotType] = useState("number");
  const [slotInput, setSlotInput] = useState("");
  const [convertedSlot, setConvertedSlot] = useState("");
  const [selectedRpc, setSelectedRpc] = useState("");
  const [storageValue, setStorageValue] = useState(null);
  const [expectedType, setExpectedType] = useState("uint256");
  const [slotNature, setSlotNature] = useState("static");
  const [dynamicIndex, setDynamicIndex] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const networks = useMemo(
    () => [
      { name: "Ethereum Mainnet", rpc: config.networks.ethereum.rpc },
      { name: "Ethereum Testnet", rpc: config.networks.sepolia.rpc },
      { name: "Polygon Mainnet", rpc: config.networks.polygon.rpc },
      { name: "Polygon Testnet", rpc: config.networks.polygonAmoy.rpc },
      { name: "Base Mainnet", rpc: config.networks.mainnetBase.rpc },
      { name: "Base Testnet", rpc: config.networks.sepoliaBase.rpc },
      { name: "ZetaChain Mainnet", rpc: config.networks.mainnetZeta.rpc },
      { name: "ZetaChain Testnet", rpc: config.networks.testnetZeta.rpc },
    ],
    []
  );

  useEffect(() => {
    if (networks.length > 0) setSelectedRpc(networks[0].rpc);
  }, [networks]);

  // Validate address format dynamically
  useEffect(() => {
    if (contractAddress.length > 0) {
      setIsValidAddress(ethers.isAddress(contractAddress));
    } else {
      setIsValidAddress(true);
    }
  }, [contractAddress]);

  useEffect(() => {
    setSlotInput("");
  }, [slotType]);

  useEffect(() => {
    let finalSlotInput;
    try {
      const slotNumber = BigInt(slotInput || "0");
      const indexValue = BigInt(dynamicIndex || "0");

      if (slotNature === "dynamic") {
        finalSlotInput = (slotNumber + indexValue).toString();
      } else {
        finalSlotInput = slotNumber.toString();
      }
      setConvertedSlot(finalSlotInput);
    } catch (e) {
      setConvertedSlot("Invalid Input");
    }
  }, [slotInput, slotNature, dynamicIndex]);

  async function handleClick() {
    if (
      !contractAddress ||
      !isValidAddress ||
      !convertedSlot ||
      convertedSlot === "Invalid Input"
    ) {
      return;
    }

    setLoading(true);
    setStorageValue(null); // Clear previous results
    try {
      const provider = new ethers.JsonRpcProvider(selectedRpc, "any");
      const slotHex = ethers.toBeHex(convertedSlot, 32);
      const value = await provider.getStorage(contractAddress, slotHex);
      setStorageValue(value);
    } catch (error) {
      console.error("Failed to fetch storage slot:", error);
      setStorageValue("Error fetching slot.");
    }
    setLoading(false);
  }

  function formatValue(value) {
    if (!value) return "N/A";
    if (value === "Error fetching slot.") return value;

    try {
      switch (expectedType) {
        case "uint256":
          return BigInt(value).toString();
        case "address":
          return "0x" + value.slice(26);
        case "bool":
          return (BigInt(value) & 1n) === 1n ? "TRUE" : "FALSE";
        case "bytes32":
        default:
          return value;
      }
    } catch (e) {
      return "Parsing Error";
    }
  }

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w3-storage-wrapper">
      <div className="w3-storage-card">
        {/* Header */}
        <div className="w3-card-header">
          <div className="w3-header-icon">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
          </div>
          <h2>Storage Inspector</h2>
          <p>Query raw EVM state variables seamlessly</p>
        </div>

        {/* Section 1: Target Context */}
        <div className="w3-section">
          <h3 className="w3-section-title">Target Contract</h3>
          <div className="w3-form-grid">
            <div className="w3-form-group w3-col-span-full">
              <label>Network Provider</label>
              <select
                value={selectedRpc}
                onChange={(e) => setSelectedRpc(e.target.value)}
              >
                {networks.map((net) => (
                  <option key={net.rpc} value={net.rpc}>
                    {net.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="w3-form-group w3-col-span-full">
              <label>Contract Address</label>
              <input
                type="text"
                placeholder="0x..."
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
                className={`w3-mono-input ${
                  !isValidAddress ? "w3-input-error" : ""
                }`}
              />
              {!isValidAddress && (
                <span className="w3-error-text">Invalid Ethereum Address</span>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Slot Configuration */}
        <div className="w3-section">
          <h3 className="w3-section-title">Slot Parameters</h3>
          <div className="w3-form-grid">
            <div className="w3-form-group">
              <label>Input Format</label>
              <select
                value={slotType}
                onChange={(e) => setSlotType(e.target.value)}
              >
                <option value="number">Numeric Index</option>
                <option value="bytes32">Bytes32 Keccak</option>
              </select>
            </div>

            <div className="w3-form-group">
              <label>Base Slot Position</label>
              <input
                type="text"
                placeholder="e.g. 0"
                value={slotInput}
                onChange={(e) => setSlotInput(e.target.value)}
                className="w3-mono-input"
              />
            </div>

            <div className="w3-form-group">
              <label>Slot Architecture</label>
              <select
                value={slotNature}
                onChange={(e) => setSlotNature(e.target.value)}
              >
                <option value="static">Static Variable</option>
                <option value="dynamic">Mapping / Array</option>
              </select>
            </div>

            <div className="w3-form-group w3-animate-fade">
              {slotNature === "dynamic" ? (
                <>
                  <label>Dynamic Key / Index</label>
                  <input
                    type="number"
                    placeholder="Enter key"
                    value={dynamicIndex}
                    onChange={(e) => setDynamicIndex(e.target.value)}
                    className="w3-mono-input"
                  />
                </>
              ) : null}
            </div>

            <div className="w3-form-group w3-col-span-full">
              <label>Cast Output As</label>
              <select
                value={expectedType}
                onChange={(e) => setExpectedType(e.target.value)}
              >
                <option value="uint256">uint256</option>
                <option value="address">address</option>
                <option value="bool">boolean</option>
                <option value="bytes32">bytes32</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          className={`w3-submit-btn ${loading ? "w3-btn-loading" : ""}`}
          onClick={handleClick}
          disabled={loading || !isValidAddress || !contractAddress}
        >
          {loading ? (
            <span className="w3-loader-flex">
              <svg className="w3-spinner" viewBox="0 0 50 50">
                <circle
                  cx="25"
                  cy="25"
                  r="20"
                  fill="none"
                  strokeWidth="5"
                ></circle>
              </svg>
              Querying State...
            </span>
          ) : (
            "Read Storage Slot"
          )}
        </button>

        {/* Results Section */}
        {storageValue !== null && (
          <div className="w3-results-container w3-animate-slide-up">
            <div className="w3-result-header">
              <h3>Query Result</h3>
              <button
                className="w3-copy-btn"
                onClick={() => handleCopy(formatValue(storageValue))}
              >
                {copied ? (
                  "Copied!"
                ) : (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect
                      x="9"
                      y="9"
                      width="13"
                      height="13"
                      rx="2"
                      ry="2"
                    ></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                )}
              </button>
            </div>

            <div className="w3-result-body">
              <div className="w3-result-meta">
                <span>Target Slot:</span>
                <code className="w3-slot-badge">{convertedSlot}</code>
              </div>
              <div className="w3-result-data">{formatValue(storageValue)}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Component3;