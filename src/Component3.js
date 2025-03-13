import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import "./Component3.css";
import config from "./config";

const Component3 = () => {
  const [contractAddress, setContractAddress] = useState("");
  const [slotType, setSlotType] = useState("number");
  const [slotInput, setSlotInput] = useState("");
  const [convertedSlot, setConvertedSlot] = useState("");
  const [selectedRpc, setSelectedRpc] = useState("");
  const [storageValue, setStorageValue] = useState(null);
  const [expectedType, setExpectedType] = useState("uint256");

  const networks = [
    {
      name: "Ethereum Mainnet",
      rpc: config.networks.ethereum.rpc,
    },
    {
      name: "Ethereum Sepolia",
      rpc: config.networks.sepolia.rpc,
    },
    {
      name: "Polygon",
      rpc: config.networks.polygon.rpc,
    },
  ];

  useEffect(() => {
    setSelectedRpc(networks[0].rpc);
  }, []);

  useEffect(() => {
    if (
      slotType === "bytes32" &&
      slotInput.startsWith("0x") &&
      slotInput.length === 66
    ) {
      const keccakValue = BigInt(slotInput).toString();
      setConvertedSlot(keccakValue);
    } else {
      setConvertedSlot(slotInput);
    }
  }, [slotType, slotInput]);

  async function handleClick() {
    if (!contractAddress || !convertedSlot) {
      console.error("❌ Please enter a valid contract address and slot.");
      return;
    }

    try {
      const provider = new ethers.JsonRpcProvider(selectedRpc, "any");
      const slotHex = ethers.toBeHex(convertedSlot, 32);
      console.log(
        `📦 Fetching slot ${convertedSlot} (${slotHex}) from ${contractAddress}...`
      );
      const value = await provider.getStorage(contractAddress, slotHex);
      setStorageValue(value);
    } catch (error) {
      console.error("❌ Failed to fetch storage slot:", error);
      setStorageValue("Error fetching slot.");
    }
  }

  function formatValue(value) {
    if (!value) return "N/A";
    if (expectedType === "uint256") {
      return BigInt(value).toString();
    }
    if (expectedType === "address") {
      return "0x" + value.slice(26);
    }
    if (expectedType === "bool") {
      return (BigInt(value) & 1n) === 1n ? "TRUE" : "FALSE";
    }
    return value;
  }

  return (
    <div className="component3">
      <div className="container">
        <h2>🔍 Storage Slot Viewer</h2>
        <div className="form-group">
          <label>Contract Address</label>
          <input
            type="text"
            placeholder="0x..."
            value={contractAddress}
            onChange={(e) => setContractAddress(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Slot Input Type</label>
          <select
            value={slotType}
            onChange={(e) => setSlotType(e.target.value)}
          >
            <option value="number">Slot Number</option>
            <option value="bytes32">Bytes32 Keccak</option>
          </select>
        </div>
        <div className="form-group">
          <label>{slotType === "number" ? "Slot Number" : "Slot Keccak"}</label>
          <input
            type="text"
            placeholder="Enter value"
            value={slotInput}
            onChange={(e) => setSlotInput(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Expected Data Type</label>
          <select
            value={expectedType}
            onChange={(e) => setExpectedType(e.target.value)}
          >
            <option value="uint256">uint256</option>
            <option value="address">address</option>
            <option value="bool">bool</option>
          </select>
        </div>
        <div className="form-group">
          <label>Select Network</label>
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
        <button className="view-btn" onClick={handleClick}>
          🔎 View Storage Slot
        </button>
        <div>
          {convertedSlot && (
            <div>
              <strong>Slot :</strong>
              <div className="highlighted-slot">{convertedSlot}</div>
            </div>
          )}
          {storageValue !== null && (
            <div>
              <strong>Value : </strong>
              <div className="highlighted-value">
                {formatValue(storageValue)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Component3;
