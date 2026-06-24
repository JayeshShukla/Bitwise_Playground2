import React, { useState, useEffect } from "react";

const Component8 = () => {
  const [inputHex, setInputHex] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
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
    let cleaned = value.replace(/[^0-9a-fA-F]/g, "").toLowerCase();

    if (cleaned.length > 2) {
      cleaned = cleaned.slice(-2);
    }

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

  // --- SEARCH LOGIC ---
  const highlightSet = new Set();
  const cleanSearch = searchQuery
    .replace(/^0x/i, "")
    .replace(/[^0-9a-fA-F]/g, "")
    .toLowerCase();

  if (cleanSearch.length > 0 && bytes.length > 0) {
    const fullHex = bytes.join("");
    let pos = 0;

    while ((pos = fullHex.indexOf(cleanSearch, pos)) !== -1) {
      const startByte = Math.floor(pos / 2);
      const endByte = Math.floor((pos + cleanSearch.length - 1) / 2);

      for (let i = startByte; i <= endByte; i++) {
        highlightSet.add(i);
      }
      pos += 1;
    }
  }

  const rows = [];
  for (let i = 0; i < bytes.length; i += 32) {
    rows.push(bytes.slice(i, i + 32));
  }

  // Strict structural constants
  const OFFSET_WIDTH = "100px";
  const PIPE_WIDTH = "24px";
  const BYTE_WIDTH = "26px";
  const BYTE_GAP = "6px";

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
        {/* HEADER CONTROLS */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: "8px",
            flexWrap: "wrap",
            gap: "12px",
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

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            {/* Search Input with matching glow on focus */}
            <div style={{ position: "relative" }}>
              <svg
                style={{
                  position: "absolute",
                  left: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#71717a",
                }}
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Find in hex..."
                spellCheck="false"
                style={{
                  backgroundColor: "#18181b",
                  border: "1px solid #3f3f46",
                  borderRadius: "6px",
                  padding: "6px 12px 6px 30px",
                  color: "#22d3ee", // Neon text for search
                  fontSize: "13px",
                  outline: "none",
                  width: "220px",
                  fontFamily: "'Courier New', Courier, monospace",
                  transition: "all 0.2s ease",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#22d3ee";
                  e.target.style.boxShadow = "0 0 10px rgba(34, 211, 238, 0.2)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#3f3f46";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <button
              onClick={handleCopy}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 16px",
                backgroundColor: copied ? "#059669" : "#27272a",
                color: copied ? "#ffffff" : "#d4d4d8",
                border: "none",
                borderRadius: "6px",
                fontSize: "13px",
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
                  Copy Calldata
                </>
              )}
            </button>
          </div>
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
              height: "140px",
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
          <div
            style={{
              height: "3px",
              width: "100%",
              background: "linear-gradient(90deg, #10b981, #0ea5e9)",
            }}
          />

          <div style={{ padding: "24px", overflowX: "auto", width: "100%" }}>
            <div
              style={{
                minWidth: "max-content",
                fontFamily: "'SF Mono', Consolas, 'Courier New', monospace",
              }}
            >
              {rows.length > 0 ? (
                <>
                  {/* HEADER ROW */}
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
                    <div
                      style={{
                        width: OFFSET_WIDTH,
                        minWidth: OFFSET_WIDTH,
                        flexShrink: 0,
                      }}
                    ></div>
                    <div
                      style={{
                        width: PIPE_WIDTH,
                        minWidth: PIPE_WIDTH,
                        flexShrink: 0,
                      }}
                    ></div>

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

                  {/* DATA ROWS */}
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
                        {/* Offset Column */}
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

                        {/* Pipe Separator Column */}
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

                        {/* Byte Inputs */}
                        <div style={{ display: "flex", gap: BYTE_GAP }}>
                          {Array.from({ length: 32 }).map((_, byteIndex) => {
                            const byte = row[byteIndex] || "00";
                            const isZero = byte === "00";
                            const globalIndex = offset + byteIndex;

                            const isHighlighted = highlightSet.has(globalIndex);

                            // The Glow Logic
                            let bgColor = "transparent";
                            let textColor = isZero ? "#3f3f46" : "#10b981"; // Default Gray or Emerald
                            let fontWeight = isZero ? "normal" : "bold";
                            let glowShadow = "none";
                            let textGlow = "none";
                            let zIndex = 0;

                            if (isHighlighted) {
                              bgColor = "rgba(34, 211, 238, 0.1)"; // Very faint cyan tint
                              textColor = "#a5f3fc"; // Almost white cyan
                              fontWeight = "bold";
                              // Inner and outer glow for the box
                              glowShadow =
                                "0 0 12px rgba(34, 211, 238, 0.4), inset 0 0 6px rgba(34, 211, 238, 0.2)";
                              // Text glowing effect
                              textGlow = "0 0 8px rgba(34, 211, 238, 0.8)";
                              zIndex = 10; // Pop above other inputs so shadow isn't clipped
                            }

                            return (
                              <input
                                key={byteIndex}
                                type="text"
                                value={byte}
                                spellCheck="false"
                                onChange={(e) =>
                                  handleByteChange(globalIndex, e.target.value)
                                }
                                maxLength={3}
                                style={{
                                  width: BYTE_WIDTH,
                                  minWidth: BYTE_WIDTH,
                                  height: "24px",
                                  flexShrink: 0,
                                  textAlign: "center",
                                  boxSizing: "border-box",
                                  padding: "0",
                                  margin: "0",
                                  border: isHighlighted
                                    ? "1px solid rgba(34, 211, 238, 0.5)"
                                    : "1px solid transparent",
                                  borderRadius: isHighlighted ? "4px" : "0",
                                  outline: "none",
                                  backgroundColor: bgColor,
                                  fontSize: "14px",
                                  fontFamily: "inherit",
                                  color: textColor,
                                  fontWeight: fontWeight,
                                  boxShadow: glowShadow,
                                  textShadow: textGlow,
                                  position: "relative",
                                  zIndex: zIndex,
                                  transition: "all 0.15s ease",
                                  cursor: "text",
                                }}
                                onFocus={(e) => {
                                  e.target.style.backgroundColor = isHighlighted
                                    ? "rgba(34, 211, 238, 0.2)"
                                    : "#27272a";
                                  e.target.style.color = "#ffffff";
                                  e.target.style.border = isHighlighted
                                    ? "1px solid #22d3ee"
                                    : "1px solid #10b981";
                                  e.target.style.boxShadow = isHighlighted
                                    ? "0 0 16px rgba(34, 211, 238, 0.6)"
                                    : "none";
                                  e.target.style.borderRadius = "4px";
                                  e.target.select();
                                }}
                                onBlur={(e) => {
                                  e.target.style.backgroundColor = bgColor;
                                  e.target.style.color = isHighlighted
                                    ? textColor
                                    : e.target.value === "00"
                                    ? "#3f3f46"
                                    : "#10b981";
                                  e.target.style.border = isHighlighted
                                    ? "1px solid rgba(34, 211, 238, 0.5)"
                                    : "1px solid transparent";
                                  e.target.style.boxShadow = glowShadow;
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
