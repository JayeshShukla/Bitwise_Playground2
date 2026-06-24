import React, { useState, useEffect } from "react";

const Component8 = () => {
  const [inputHex, setInputHex] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [bytes, setBytes] = useState([]);
  const [copied, setCopied] = useState(false);
  const [copiedRowIndex, setCopiedRowIndex] = useState(null);

  // Drag & Drop Selection States
  const [selectionStart, setSelectionStart] = useState(null);
  const [selectionEnd, setSelectionEnd] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectionCopied, setSelectionCopied] = useState(false);

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

  // Global Mouse Up to stop dragging
  useEffect(() => {
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, []);

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

  const handleRowCopy = (rowArray, rowIndex) => {
    const rowHex = rowArray.join("");
    navigator.clipboard.writeText(rowHex);
    setCopiedRowIndex(rowIndex);
    setTimeout(() => setCopiedRowIndex(null), 2000);
  };

  // Drag Selection Handlers
  const handleMouseDown = (index) => {
    setSelectionStart(index);
    setSelectionEnd(index);
    setIsDragging(true);
  };

  const handleMouseEnter = (index) => {
    if (isDragging) {
      setSelectionEnd(index);
      window.getSelection()?.removeAllRanges();
    }
  };

  const hasRangeSelection =
    selectionStart !== null &&
    selectionEnd !== null &&
    selectionStart !== selectionEnd;

  const handleCopySelection = () => {
    if (!hasRangeSelection) return;
    const min = Math.min(selectionStart, selectionEnd);
    const max = Math.max(selectionStart, selectionEnd);
    const selectedBytes = bytes.slice(min, max + 1).join("");

    navigator.clipboard.writeText(selectedBytes);
    setSelectionCopied(true);
    setTimeout(() => {
      setSelectionCopied(false);
    }, 2000);
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
        position: "relative",
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
            Paste Calldata ({bytes.length} bytes)
          </label>

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
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
                  color: "#60a5fa", // Azure Blue-400 text
                  fontSize: "13px",
                  outline: "none",
                  width: "220px",
                  fontFamily: "'Courier New', Courier, monospace",
                  transition: "all 0.2s ease",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#60a5fa";
                  e.target.style.boxShadow = "0 0 10px rgba(96, 165, 250, 0.2)";
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
              background: "linear-gradient(90deg, #10b981, #3b82f6)",
            }}
          />

          <div
            style={{
              padding: "24px",
              overflowX: "auto",
              width: "100%",
              position: "relative",
            }}
          >
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

                    <div
                      style={{
                        width: "36px",
                        minWidth: "36px",
                        flexShrink: 0,
                        marginLeft: "12px",
                      }}
                    ></div>
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
                            const isRangeSelected =
                              hasRangeSelection &&
                              globalIndex >=
                                Math.min(selectionStart, selectionEnd) &&
                              globalIndex <=
                                Math.max(selectionStart, selectionEnd);

                            // Styling Priority: Selection overrides Search Highlight
                            let bgColor = "transparent";
                            let textColor = isZero ? "#3f3f46" : "#10b981";
                            let fontWeight = isZero ? "normal" : "bold";
                            let glowShadow = "none";
                            let textGlow = "none";
                            let borderColor = "transparent";
                            let zIndex = 0;

                            if (isHighlighted) {
                              bgColor = "rgba(59, 130, 246, 0.15)"; // Azure Blue tint
                              textColor = "#93c5fd"; // Blue-300
                              fontWeight = "bold";
                              borderColor = "rgba(59, 130, 246, 0.5)"; // Blue-500
                              glowShadow =
                                "0 0 12px rgba(59, 130, 246, 0.3), inset 0 0 6px rgba(59, 130, 246, 0.15)";
                              textGlow = "0 0 8px rgba(59, 130, 246, 0.6)";
                              zIndex = 10;
                            }

                            if (isRangeSelected) {
                              bgColor = "rgba(139, 92, 246, 0.25)"; // Soft Lavender tint
                              textColor = "#c4b5fd"; // Violet-300
                              fontWeight = "bold";
                              borderColor = "rgba(139, 92, 246, 0.6)"; // Violet-500
                              glowShadow = "0 0 12px rgba(139, 92, 246, 0.4)";
                              textGlow = "0 0 8px rgba(139, 92, 246, 0.7)";
                              zIndex = 20;
                            }

                            return (
                              <input
                                key={byteIndex}
                                type="text"
                                value={byte}
                                spellCheck="false"
                                onMouseDown={() => handleMouseDown(globalIndex)}
                                onMouseEnter={() =>
                                  handleMouseEnter(globalIndex)
                                }
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
                                  border: `1px solid ${borderColor}`,
                                  borderRadius:
                                    isHighlighted || isRangeSelected
                                      ? "4px"
                                      : "0",
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
                                  transition: "all 0.1s ease",
                                  cursor: "text",
                                }}
                                onFocus={(e) => {
                                  if (!isDragging) {
                                    setSelectionStart(null);
                                    setSelectionEnd(null);
                                  }

                                  e.target.style.backgroundColor =
                                    isRangeSelected
                                      ? "rgba(139, 92, 246, 0.3)"
                                      : isHighlighted
                                      ? "rgba(59, 130, 246, 0.25)"
                                      : "#27272a";
                                  e.target.style.color = "#ffffff";
                                  e.target.style.border = isRangeSelected
                                    ? "1px solid #a78bfa"
                                    : isHighlighted
                                    ? "1px solid #60a5fa"
                                    : "1px solid #10b981";
                                  e.target.style.boxShadow = isRangeSelected
                                    ? "0 0 16px rgba(139, 92, 246, 0.6)"
                                    : isHighlighted
                                    ? "0 0 16px rgba(59, 130, 246, 0.5)"
                                    : "none";

                                  e.target.select();
                                }}
                                onBlur={(e) => {
                                  e.target.style.backgroundColor = bgColor;
                                  e.target.style.color =
                                    isHighlighted || isRangeSelected
                                      ? textColor
                                      : e.target.value === "00"
                                      ? "#3f3f46"
                                      : "#10b981";
                                  e.target.style.border = `1px solid ${borderColor}`;
                                  e.target.style.boxShadow = glowShadow;
                                }}
                              />
                            );
                          })}
                        </div>

                        {/* Row Copy Button */}
                        <div
                          style={{
                            width: "36px",
                            minWidth: "36px",
                            flexShrink: 0,
                            marginLeft: "12px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <button
                            onClick={() => handleRowCopy(row, rowIndex)}
                            title="Copy 32-byte row"
                            style={{
                              background: "transparent",
                              border: "none",
                              color:
                                copiedRowIndex === rowIndex
                                  ? "#10b981"
                                  : "#52525b",
                              cursor: "pointer",
                              padding: "4px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              transition:
                                "color 0.2s ease, transform 0.1s ease",
                              transform:
                                copiedRowIndex === rowIndex
                                  ? "scale(1.1)"
                                  : "scale(1)",
                            }}
                            onMouseEnter={(e) => {
                              if (copiedRowIndex !== rowIndex)
                                e.currentTarget.style.color = "#d4d4d8";
                            }}
                            onMouseLeave={(e) => {
                              if (copiedRowIndex !== rowIndex)
                                e.currentTarget.style.color = "#52525b";
                            }}
                          >
                            {copiedRowIndex === rowIndex ? (
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            ) : (
                              <svg
                                width="16"
                                height="16"
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
                            )}
                          </button>
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

        {/* --- FLOATING COPY TOOLTIP FOR DRAG SELECTION --- */}
        {hasRangeSelection && !isDragging && (
          <div
            style={{
              position: "fixed",
              bottom: "40px",
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "#18181b",
              border: "1px solid #3f3f46",
              padding: "10px 20px",
              borderRadius: "999px",
              boxShadow:
                "0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 20px rgba(139, 92, 246, 0.2)",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              zIndex: 100,
            }}
          >
            <span
              style={{
                color: "#d4d4d8",
                fontSize: "14px",
                fontWeight: "500",
                fontFamily: "'SF Mono', monospace",
              }}
            >
              Selected {Math.abs(selectionEnd - selectionStart) + 1} bytes
            </span>

            <button
              onClick={handleCopySelection}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                backgroundColor: selectionCopied ? "#059669" : "#8b5cf6", // Indigo/Lavender button
                color: "#ffffff",
                border: "none",
                borderRadius: "999px",
                fontSize: "13px",
                fontWeight: "bold",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {selectionCopied ? (
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
                  Copy Hex
                </>
              )}
            </button>

            <button
              onClick={() => {
                setSelectionStart(null);
                setSelectionEnd(null);
              }}
              style={{
                background: "transparent",
                border: "none",
                color: "#71717a",
                cursor: "pointer",
                padding: "4px",
                display: "flex",
                alignItems: "center",
              }}
              title="Clear selection"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Component8;
