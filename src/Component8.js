import React, { useState, useEffect } from "react";

const Component8 = () => {
  const [inputHex, setInputHex] = useState("");
  const [bytes, setBytes] = useState([]);
  const [copied, setCopied] = useState(false);

  const processHex = (rawString) => {
    let cleaned = rawString.replace(/^0x/i, "").replace(/\s+/g, "");
    if (cleaned.length % 2 !== 0) cleaned = "0" + cleaned;

    const result = [];
    for (let i = 0; i < cleaned.length; i += 2) {
      result.push(cleaned.slice(i, i + 2).toLowerCase());
    }
    return result;
  };

  const bytesToHex = (bytesArray) => {
    return bytesArray.join("");
  };

  useEffect(() => {
    if (!inputHex) {
      setBytes([]);
      return;
    }
    setBytes(processHex(inputHex));
  }, [inputHex]);

  const handleInputChange = (e) => {
    setInputHex(e.target.value);
  };

  const handleByteChange = (index, value) => {
    // Strip non-hex characters
    let cleaned = value.replace(/[^0-9a-fA-F]/g, "").toLowerCase();

    // The magic fix: If typing makes it "003", keep the last two digits ("03").
    // If they type "4" next, it becomes "034" -> keeps "34".
    if (cleaned.length > 2) {
      cleaned = cleaned.slice(-2);
    }

    // Always keep it 2 characters for visual grid stability
    cleaned = cleaned.padStart(2, "0");

    const newBytes = [...bytes];
    newBytes[index] = cleaned;
    setBytes(newBytes);
    setInputHex(bytesToHex(newBytes));
  };

  const handleCopy = () => {
    const textToCopy = inputHex.startsWith("0x") ? inputHex : `0x${inputHex}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const rows = [];
  for (let i = 0; i < bytes.length; i += 32) {
    rows.push(bytes.slice(i, i + 32));
  }

  // Strict structural constants to guarantee pixel-perfect alignment
  const OFFSET_WIDTH = "100px"; // Fixed space for "0080 (128)"
  const PIPE_WIDTH = "24px"; // Fixed space for the "|" separator
  const BYTE_WIDTH = "26px"; // Fixed space for each byte "ff"
  const BYTE_GAP = "6px"; // Fixed gap between bytes

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "#09090b",
        padding: "24px",
        color: "#d4d4d8",
        fontFamily: "system-ui, -apple-system, sans-serif",
        boxSizing: "border-box",
        display: "block",
      }}
    >
      <div style={{ maxWidth: "1600px", margin: "0 auto", width: "100%" }}>
        {/* Header and Controls */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: "8px",
          }}
        >
          <label
            style={{
              display: "block",
              color: "#9ca3af",
              fontWeight: "600",
              fontSize: "14px",
            }}
          >
            Paste Calldata or Hex Here (0x is ignored)
          </label>

          <button
            onClick={handleCopy}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              backgroundColor: copied ? "#059669" : "#27272a",
              color: copied ? "#ffffff" : "#d4d4d8",
              border: "none",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            {copied ? (
              <>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                Copy Calldata
              </>
            )}
          </button>
        </div>

        {/* BIG INPUT */}
        <div style={{ marginBottom: "24px", width: "100%", display: "block" }}>
          <textarea
            value={inputHex}
            onChange={handleInputChange}
            placeholder="0x..."
            spellCheck="false"
            style={{
              width: "100%",
              minWidth: "100%",
              height: "160px",
              backgroundColor: "#18181b",
              border: "1px solid #27272a",
              borderRadius: "8px",
              padding: "16px",
              color: "#a1a1aa",
              outline: "none",
              boxSizing: "border-box",
              fontFamily: "'Courier New', Courier, monospace",
              fontSize: "14px",
              lineHeight: "1.5",
              display: "block",
              resize: "vertical",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#10b981")}
            onBlur={(e) => (e.target.style.borderColor = "#27272a")}
          />
        </div>

        {/* HEX VIEWER */}
        <div
          style={{
            backgroundColor: "#121214",
            border: "1px solid #27272a",
            borderRadius: "12px",
            overflow: "hidden",
            width: "100%",
          }}
        >
          {/* Accent Header Bar */}
          <div
            style={{
              height: "3px",
              width: "100%",
              background: "linear-gradient(90deg, #10b981, #0ea5e9)",
            }}
          />

          <div style={{ padding: "24px", overflowX: "auto", width: "100%" }}>
            {/* Wrapper forces exact width to prevent wrapping */}
            <div
              style={{
                minWidth: "max-content",
                fontFamily: "'SF Mono', Consolas, 'Courier New', monospace",
              }}
            >
              {rows.length > 0 ? (
                <>
                  {/* === STRICT HEADER ROW === */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      flexWrap: "nowrap",
                      marginBottom: "12px",
                      paddingBottom: "8px",
                      borderBottom: "1px solid #27272a",
                      alignItems: "center",
                    }}
                  >
                    {/* Empty block matching exactly the width of the offset column */}
                    <div
                      style={{
                        width: OFFSET_WIDTH,
                        minWidth: OFFSET_WIDTH,
                        flexShrink: 0,
                      }}
                    ></div>

                    {/* Empty block matching exactly the width of the pipe column */}
                    <div
                      style={{
                        width: PIPE_WIDTH,
                        minWidth: PIPE_WIDTH,
                        flexShrink: 0,
                      }}
                    ></div>

                    {/* Decimal Numbers (00 to 31) */}
                    <div style={{ display: "flex", gap: BYTE_GAP }}>
                      {Array.from({ length: 32 }).map((_, i) => (
                        <div
                          key={i}
                          style={{
                            width: BYTE_WIDTH,
                            minWidth: BYTE_WIDTH,
                            textAlign: "center",
                            color: "#52525b",
                            fontSize: "12px",
                            fontWeight: "bold",
                          }}
                        >
                          {i.toString().padStart(2, "0")}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* === DATA ROWS === */}
                  {rows.map((row, rowIndex) => {
                    const offset = rowIndex * 32;
                    const isEvenRow = rowIndex % 2 === 0;

                    return (
                      <div
                        key={rowIndex}
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          flexWrap: "nowrap",
                          alignItems: "center",
                          padding: "2px 0",
                          backgroundColor: isEvenRow
                            ? "transparent"
                            : "#18181b",
                          borderRadius: "4px",
                        }}
                        className="hover:bg-[#27272a] transition-colors"
                      >
                        {/* 1. Offset Column (Strict Width) */}
                        <div
                          style={{
                            width: OFFSET_WIDTH,
                            minWidth: OFFSET_WIDTH,
                            flexShrink: 0,
                            display: "flex",
                            justifyContent: "flex-end",
                            alignItems: "center",
                            fontSize: "13px",
                          }}
                        >
                          <span style={{ color: "#71717a" }}>
                            {offset.toString(16).padStart(4, "0")}
                          </span>
                          <span
                            style={{
                              color: "#3f3f46",
                              marginLeft: "6px",
                              fontSize: "11px",
                            }}
                          >
                            ({offset})
                          </span>
                        </div>

                        {/* 2. Pipe Separator Column (Strict Width) */}
                        <div
                          style={{
                            width: PIPE_WIDTH,
                            minWidth: PIPE_WIDTH,
                            flexShrink: 0,
                            textAlign: "center",
                            color: "#3f3f46",
                            fontSize: "12px",
                          }}
                        >
                          |
                        </div>

                        {/* 3. Byte Inputs */}
                        <div style={{ display: "flex", gap: BYTE_GAP }}>
                          {Array.from({ length: 32 }).map((_, byteIndex) => {
                            const byte = row[byteIndex] || "00";
                            const isZero = byte === "00";
                            const globalIndex = offset + byteIndex;

                            return (
                              <input
                                key={byteIndex}
                                type="text"
                                value={byte}
                                spellCheck="false"
                                onChange={(e) =>
                                  handleByteChange(globalIndex, e.target.value)
                                }
                                maxLength={3} // Allowing 3 so the user can type the next digit before it slices to 2
                                style={{
                                  width: BYTE_WIDTH,
                                  minWidth: BYTE_WIDTH,
                                  height: "24px",
                                  flexShrink: 0,
                                  textAlign: "center",
                                  boxSizing: "border-box",
                                  padding: "0",
                                  margin: "0",
                                  border: "1px solid transparent",
                                  outline: "none",
                                  backgroundColor: "transparent",
                                  fontSize: "14px",
                                  fontFamily: "inherit",
                                  color: isZero ? "#3f3f46" : "#10b981",
                                  fontWeight: isZero ? "normal" : "bold",
                                  transition: "all 0.1s ease",
                                  cursor: "text",
                                }}
                                onFocus={(e) => {
                                  e.target.style.backgroundColor = "#27272a";
                                  e.target.style.color = "#ffffff";
                                  e.target.style.border = "1px solid #10b981";
                                  e.target.style.borderRadius = "3px";
                                  e.target.select(); // Auto-select text on click for easier replacement
                                }}
                                onBlur={(e) => {
                                  e.target.style.backgroundColor =
                                    "transparent";
                                  e.target.style.color =
                                    e.target.value === "00"
                                      ? "#3f3f46"
                                      : "#10b981";
                                  e.target.style.border =
                                    "1px solid transparent";
                                }}
                              />
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </>
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "60px 0",
                    color: "#52525b",
                  }}
                >
                  Waiting for calldata payload...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Component8;
