import React, { useState, useEffect, useMemo } from "react";
import "./Component4.css";

const BITS_TOTAL = 256;
const BITS_PER_BYTE = 8;
const BYTES_TOTAL = BITS_TOTAL / BITS_PER_BYTE;

const Component4 = () => {
  const [inputValue, setInputValue] = useState("");
  const [inputFormat, setInputFormat] = useState("decimal");
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(255);
  const [isDragging, setIsDragging] = useState(null);
  const [copied, setCopied] = useState(false);

  const bigIntNumber = useMemo(() => {
    if (!inputValue.trim()) return null;
    try {
      return inputFormat === "decimal"
        ? BigInt(inputValue)
        : BigInt(inputValue.startsWith("0x") ? inputValue : "0x" + inputValue);
    } catch {
      return null;
    }
  }, [inputValue, inputFormat]);

  const bitArray = useMemo(() => {
    if (!bigIntNumber) return Array(256).fill("0");
    let binary = bigIntNumber.toString(2).padStart(256, "0");
    return binary.split("");
  }, [bigIntNumber]);

  const handleMouseDown = (index) => {
    setIsDragging(index <= (startIndex + endIndex) / 2 ? "start" : "end");
  };

  const handleMouseEnter = (index) => {
    if (!isDragging) return;
    if (isDragging === "start") {
      setStartIndex(Math.min(index, endIndex));
    } else {
      setEndIndex(Math.max(index, startIndex));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  useEffect(() => {
    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, []);

  const selectedBinary = bitArray
    .slice(Math.min(startIndex, endIndex), Math.max(startIndex, endIndex) + 1)
    .join("");
  const selectedBigInt = selectedBinary
    ? BigInt("0b" + selectedBinary)
    : BigInt(0);

  const byteChunks = Array.from({ length: BYTES_TOTAL }, (_, byteIndex) =>
    bitArray.slice(byteIndex * 8, (byteIndex + 1) * 8)
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(selectedBinary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy to clipboard", err);
    }
  };

  return (
    <div className="binary-slider-grid">
      <h2>Binary Representation Grid</h2>
      <div className="input-section">
        <label>
          Format:
          <select
            value={inputFormat}
            onChange={(e) => setInputFormat(e.target.value)}
          >
            <option value="decimal">Decimal</option>
            <option value="hexadecimal">Hexadecimal</option>
          </select>
        </label>
        <label>
          Number:
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter a number"
          />
        </label>
      </div>

      <div className="byte-grid">
        <div className="byte-row">
          {byteChunks.map((byte, byteIndex) => (
            <React.Fragment key={byteIndex}>
              <div>{32 - byteIndex}</div>
              <div className="byte-group">
                {byte.map((bit, bitIndex) => {
                  const globalIndex = byteIndex * 8 + bitIndex;
                  const isSelected =
                    globalIndex >= startIndex && globalIndex <= endIndex;
                  return (
                    <span
                      key={globalIndex}
                      className={`bit ${isSelected ? "selected" : ""}`}
                      onMouseDown={() => handleMouseDown(globalIndex)}
                      onMouseEnter={() => handleMouseEnter(globalIndex)}
                    >
                      {bit}
                    </span>
                  );
                })}
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="output-section">
        <div>
          <strong>Selected Decimal Value:</strong> {selectedBigInt.toString(10)}
        </div>
        <div className="binary-copy-section">
          <button onClick={handleCopy} className="copy-button">
            Copy
          </button>
          {copied && <span className="copied-message">Copied!</span>}
        </div>
      </div>
    </div>
  );
};

export default Component4;
