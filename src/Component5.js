import React, { useState } from "react";
import "./Component5.css";

const toHex = (value) => {
  const hexStr = BigInt.asUintN(256, BigInt(value)).toString(16);
  return "0x" + hexStr.padStart(64, "0");
};

const toBinary = (value) => {
  const binStr = BigInt.asUintN(256, BigInt(value)).toString(2);
  return (
    "0b" +
    binStr
      .padStart(256, "0")
      .match(/.{1,8}/g)
      .join(" ")
  );
};

const parseHex = (hexStr) => {
  hexStr = hexStr.replace("0x", "").replace(/[^0-9a-fA-F]/g, "");
  if (hexStr === "") return { parsed: 0n, signed: 0n };
  const significantHex = hexStr.replace(/^0+/, "");
  const bitWidth = significantHex.length * 4 || 1; // Minimum 1 bit for zero
  const parsed = BigInt("0x" + hexStr);
  const signed = BigInt.asIntN(bitWidth, parsed);
  return { parsed, signed };
};

const parseBinary = (binStr) => {
  binStr = binStr.replace("0b", "").replace(/\s+/g, "").replace(/[^01]/g, "");
  if (binStr === "") return { parsed: 0n, signed: 0n };
  const parsed = BigInt("0b" + binStr);
  const bitWidth = binStr.length;
  const signed = BigInt.asIntN(bitWidth, parsed);
  return { parsed, signed };
};

const parseUint256 = (value) => {
  if (value.startsWith("-")) return null;
  return BigInt(value);
};

const parseInt256 = (value) => {
  return BigInt(value);
};

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text.replace(/\s+/g, ""));
  } catch (err) {
    console.error("Failed to copy!", err);
  }
};

const Component5 = () => {
  const [fields, setFields] = useState({
    uint256: "",
    int256: "",
    hexInput: "", // User’s exact input for hex
    binary: "",
  });

  const handleChange = (type, rawValue) => {
    if (type === "hexInput") {
      const { parsed, signed } = parseHex(rawValue);
      setFields({
        uint256: parsed.toString(),
        int256: signed.toString(),
        hexInput: rawValue, // Keep user’s input as is
        binary: toBinary(parsed),
      });
    } else if (type === "binary") {
      const { parsed, signed } = parseBinary(rawValue);
      setFields({
        uint256: parsed.toString(),
        int256: signed.toString(),
        hexInput: parsed.toString(16), // Minimal hex without padding
        binary: rawValue,
      });
    } else if (type === "uint256") {
      try {
        const parsed = parseUint256(rawValue);
        if (parsed !== null) {
          const asInt = BigInt.asIntN(256, parsed);
          setFields({
            uint256: rawValue,
            int256: asInt.toString(),
            hexInput: parsed.toString(16), // Minimal hex
            binary: toBinary(parsed),
          });
        }
      } catch {
        setFields((prev) => ({ ...prev, uint256: rawValue }));
      }
    } else if (type === "int256") {
      try {
        const parsed = parseInt256(rawValue);
        const asUint = BigInt.asUintN(256, parsed);
        setFields({
          uint256: asUint.toString(),
          int256: rawValue,
          hexInput: asUint.toString(16), // Minimal hex
          binary: toBinary(asUint),
        });
      } catch {
        setFields((prev) => ({ ...prev, int256: rawValue }));
      }
    }
  };

  // Compute padded hex for display or copying
  const paddedHex = fields.hexInput
    ? toHex(parseHex(fields.hexInput).parsed)
    : "";

  return (
    <div className="converter-container">
      <h2>Universal Value Converter</h2>
      <div className="output-item">
        <label className="label">uint256</label>
        <input
          className="value"
          value={fields.uint256}
          onChange={(e) => handleChange("uint256", e.target.value)}
          placeholder="Enter uint256"
          inputMode="numeric"
        />
        <button onClick={() => copyToClipboard(fields.uint256)}>Copy</button>
      </div>
      <div className="output-item">
        <label className="label">int256</label>
        <input
          className="value"
          value={fields.int256}
          onChange={(e) => handleChange("int256", e.target.value)}
          placeholder="Enter int256"
          inputMode="numeric"
        />
        <button onClick={() => copyToClipboard(fields.int256)}>Copy</button>
      </div>
      <div className="output-item">
        <label className="label">hex</label>
        <input
          className="value"
          value={fields.hexInput}
          onChange={(e) => handleChange("hexInput", e.target.value)}
          placeholder="Enter hex"
          inputMode="text"
        />
        <button onClick={() => copyToClipboard(paddedHex)}>Copy</button>
      </div>
      <div className="output-item">
        <label className="label">binary</label>
        <textarea
          className="value"
          value={fields.binary}
          onChange={(e) => handleChange("binary", e.target.value)}
          placeholder="Enter binary"
          rows={3}
        />
        <button onClick={() => copyToClipboard(fields.binary)}>Copy</button>
      </div>
      {/* Optional: Display padded hex separately */}
      {fields.hexInput && (
        <div className="padded-display">
          <span>Full 256-bit hex: {paddedHex}</span>
        </div>
      )}
    </div>
  );
};

export default Component5;
