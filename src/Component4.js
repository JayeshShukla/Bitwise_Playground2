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

  // --- 1. SMART INPUT PARSER ---
  const safeEvaluateMath = (expression) => {
    if (!expression.trim()) return null;

    // Security: Allow only numbers, hex, operators, parens, and caret
    const validChars = /^[0-9a-fA-FxX\+\-\*\/\(\)\^\s]+$/;
    if (!validChars.test(expression)) return null;

    try {
      // 1. Replace '0x...' hex strings with BigInt literals (append 'n')
      //    We match 0x followed by hex digits.
      let proc = expression.replace(/(0x[0-9a-fA-F]+)/g, "$1n");

      // 2. Replace standard decimal numbers with BigInt literals
      //    We use a lookahead to ensure we don't double-suffix numbers already marked as hex or BigInt
      //    Matches boundary, digits, boundary. Excludes if followed by 'n' or 'x'.
      proc = proc.replace(/\b(\d+)(?![nx])/g, "$1n");

      // 3. Replace '^' with '**' for exponentiation
      proc = proc.replace(/\^/g, "**");

      // 4. Evaluate safely using Function constructor
      //    This executes: return 2n ** 123n + 2n ** 23n - 1n;
      const func = new Function(`return ${proc};`);
      const result = func();

      // Ensure result is BigInt
      return typeof result === "bigint" ? result : BigInt(result);
    } catch (e) {
      return null;
    }
  };

  const bigIntNumber = useMemo(() => {
    // If format is Hex, we use standard parsing.
    // If Decimal, we use our new Smart Calculator Parser.
    if (inputFormat === "hexadecimal") {
      try {
        if (!inputValue.trim()) return null;
        return BigInt(
          inputValue.startsWith("0x") || inputValue.startsWith("-0x")
            ? inputValue
            : inputValue.startsWith("-")
            ? "-0x" + inputValue.slice(1)
            : "0x" + inputValue
        );
      } catch {
        return null;
      }
    }

    return safeEvaluateMath(inputValue);
  }, [inputValue, inputFormat]);

  const bitArray = useMemo(() => {
    if (bigIntNumber === null) return Array(256).fill("0");

    let value;
    if (bigIntNumber >= 0n) {
      value = bigIntNumber;
    } else {
      value = (1n << 256n) + bigIntNumber;
    }

    const mask256 = (1n << 256n) - 1n;
    value = value & mask256;

    const binary = value.toString(2).padStart(256, "0");
    return binary.split("");
  }, [bigIntNumber]);

  const toggleBit = (index) => {
    if (index < startIndex || index > endIndex) return;

    const currentUnsigned = BigInt("0b" + bitArray.join(""));
    const bitWeight = 1n << BigInt(255 - index);
    const newUnsigned = currentUnsigned ^ bitWeight;

    const MAX_256 = 1n << 256n;
    const MSB_WEIGHT = 1n << 255n;

    let finalBigInt = newUnsigned;
    if ((newUnsigned & MSB_WEIGHT) === MSB_WEIGHT) {
      finalBigInt = newUnsigned - MAX_256;
    }

    // When toggling, we update the input field with the raw calculated number
    // (We lose the "2^10 - 1" string here because we are modifying the value directly)
    if (inputFormat === "decimal") {
      setInputValue(finalBigInt.toString());
    } else {
      if (finalBigInt < 0n) {
        setInputValue("-0x" + (-finalBigInt).toString(16).toUpperCase());
      } else {
        setInputValue("0x" + finalBigInt.toString(16).toUpperCase());
      }
    }
  };

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

  const selectedBigInt = useMemo(() => {
    if (!selectedBinary) return 0n;
    return BigInt("0b" + selectedBinary);
  }, [selectedBinary]);

  // --- 2. SMART EXPRESSION GENERATOR ---
  const smartExpression = useMemo(() => {
    const val = selectedBigInt;
    if (val === 0n) return "0";

    // Helper: count set bits (population count)
    const countSetBits = (n) => {
      let count = 0;
      let m = n;
      while (m > 0n) {
        n &= n - 1n;
        m = m & (m - 1n);
        count++;
      }
      return count;
    };

    // Helper: Log2 for BigInt (returns -1 if not perfect power of 2)
    const getLog2 = (n) => {
      if (n <= 0n) return -1;
      const s = n.toString(2);
      // Check if it's a perfect power of 2: "1" followed by all "0"s
      if (s.indexOf("1", 1) === -1) {
        return s.length - 1;
      }
      return -1;
    };

    // Case A: Perfect Power of 2 (e.g., 2^10)
    const log2Val = getLog2(val);
    if (log2Val !== -1) {
      return `2^${log2Val}`;
    }

    // Case B: One less than a power of 2 (All 1s, e.g., 2^10 - 1)
    // We check if (val + 1) is a power of 2
    const log2PlusOne = getLog2(val + 1n);
    if (log2PlusOne !== -1) {
      return `2^${log2PlusOne} - 1`;
    }

    // Case C: Sparse Sum of Powers (e.g., 2^123 + 2^5)
    // If there are few set bits (let's say <= 5), list them out
    // Note: Counting bits on massive BigInts can be slow, but for 256 bits it's instant.
    // However, JS Bitwise ops on BigInt are fine.
    // Instead of full popcount loop, let's scan the binary string.
    const binStr = val.toString(2);
    const setBitIndices = [];
    for (let i = 0; i < binStr.length; i++) {
      if (binStr[i] === "1") {
        // Calculate power: length - 1 - index
        setBitIndices.push(binStr.length - 1 - i);
      }
    }

    if (setBitIndices.length <= 4) {
      return setBitIndices.map((pow) => `2^${pow}`).join(" + ");
    }

    // Case D: Sparse Difference (e.g., 2^100 - 2^10)
    // This happens if the binary looks like 111111000000
    // Logic: If val + (lowest set bit) is a power of 2?
    // Let's find the trailing zeros.
    let temp = val;
    let trailingZeros = 0;
    while (temp > 0n && (temp & 1n) === 0n) {
      temp >>= 1n;
      trailingZeros++;
    }
    // Now temp should be all 1s if it's a contiguous block
    if (getLog2(temp + 1n) !== -1) {
      // It is a contiguous block of 1s shifted left.
      // Example: 111100 -> (2^4 - 1) * 2^2 -> 2^6 - 2^2
      const upperPower = trailingZeros + temp.toString(2).length;
      return `2^${upperPower} - 2^${trailingZeros}`;
    }

    // Fallback: Just return the decimal string if no pattern found
    return val.toString();
  }, [selectedBigInt]);

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
            <option value="decimal">Decimal (Math)</option>
            <option value="hexadecimal">Hexadecimal</option>
          </select>
        </label>
        <label>
          Expression:
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="e.g. 2^123 + 2^10 - 1"
          />
        </label>
      </div>

      <div className="byte-grid">
        <div className="byte-row">
          {byteChunks.map((byte, byteIndex) => (
            <div className="byte-block" key={byteIndex}>
              <div className="byte-group">
                {byte.map((bit, bitIndex) => {
                  const globalIndex = byteIndex * 8 + bitIndex;
                  const isSelected =
                    globalIndex >= startIndex && globalIndex <= endIndex;
                  return (
                    <div className="bit-wrapper" key={globalIndex}>
                      <span
                        className={`bit ${
                          isSelected
                            ? bit == 1
                              ? "changed"
                              : "selected"
                            : "disabled"
                        }`}
                        onMouseDown={() => handleMouseDown(globalIndex)}
                        onMouseEnter={() => handleMouseEnter(globalIndex)}
                        onClick={() => toggleBit(globalIndex)}
                      >
                        {bit}
                      </span>
                      <span className="bit-index">{255 - globalIndex}</span>
                    </div>
                  );
                })}
              </div>
              <div className="byte-label">{32 - byteIndex}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="output-section">
        <div className="output-values">
          <div className="value-row">
            <strong>Decimal:</strong> {selectedBigInt.toString(10)}
          </div>
          {/* NEW: Smart Expression Field */}
          <div className="value-row">
            <strong>Math:</strong>{" "}
            <span className="smart-text">{smartExpression}</span>
          </div>
        </div>
        <div className="binary-copy-section">
          <button onClick={handleCopy} className="copy-button">
            Copy Binary
          </button>
          {copied && <span className="copied-message">Copied!</span>}
        </div>
      </div>
    </div>
  );
};

export default Component4;
