import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  memo,
  useRef,
} from "react";

// --- UTILITIES ---
const processHex = (rawString) => {
  let cleaned = rawString.replace(/^0x/i, "").replace(/\s+/g, "");
  if (cleaned.length % 2 !== 0) cleaned = "0" + cleaned;
  const result = [];
  for (let i = 0; i < cleaned.length; i += 2) {
    result.push(cleaned.slice(i, i + 2).toLowerCase());
  }
  return result;
};

// Layout Constants
const TOGGLE_WIDTH = "28px";
const OFFSET_WIDTH = "70px";
const PIPE_WIDTH = "24px";
const BYTE_WIDTH = "26px";
const BYTE_GAP = "6px";

// --- HIGHLY OPTIMIZED ROW COMPONENT ---
const HexRow = memo(
  ({
    rowIndex,
    bytes,
    isDisabled,
    selMin,
    selMax,
    highlightSet,
    onByteChange,
    onMouseDown,
    onMouseEnter,
    onToggleRow,
  }) => {
    const offset = rowIndex * 32;
    const isEvenRow = rowIndex % 2 === 0;

    // Build the row data
    const rowBytes = Array.from({ length: 32 }).map(
      (_, i) => bytes[offset + i] || "00"
    );
    const fullRowHex = rowBytes.join("");

    let rowBigInt = 0n;
    try {
      rowBigInt = BigInt("0x" + fullRowHex);
    } catch (e) {}

    const isMultiple = rowBigInt > 0n && rowBigInt % 32n === 0n;
    const factor = isMultiple ? (rowBigInt / 32n).toString() : "";
    const decString = rowBigInt.toString();

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "nowrap",
          alignItems: "center",
          padding: "2px 0",
          backgroundColor: isEvenRow ? "transparent" : "#18181b",
          borderRadius: "4px",
        }}
      >
        {/* Toggle Button */}
        <div
          style={{
            width: TOGGLE_WIDTH,
            minWidth: TOGGLE_WIDTH,
            flexShrink: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            onClick={() => onToggleRow(rowIndex)}
            style={{
              width: "14px",
              height: "14px",
              borderRadius: "50%",
              border: isDisabled ? "2px solid #3f3f46" : "2px solid #10b981",
              backgroundColor: isDisabled ? "#3f3f46" : "transparent",
              cursor: "pointer",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Offset */}
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
            style={{ color: "#3f3f46", marginLeft: "6px", fontSize: "11px" }}
          >
            ({offset})
          </span>
        </div>

        {/* Pipe */}
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

        {/* Bytes */}
        <div style={{ display: "flex", gap: BYTE_GAP }}>
          {Array.from({ length: 32 }).map((_, byteIndex) => {
            const byte = rowBytes[byteIndex];
            const isZero = byte === "00";
            const globalIndex = offset + byteIndex;

            if (globalIndex >= bytes.length) {
              return (
                <div
                  key={byteIndex}
                  style={{ width: BYTE_WIDTH, flexShrink: 0 }}
                />
              );
            }

            const isHighlighted = highlightSet.has(globalIndex);
            const isRangeSelected =
              selMin !== null && globalIndex >= selMin && globalIndex <= selMax;

            let bgColor = "transparent";
            let textColor = isZero ? "#3f3f46" : "#10b981";
            let fontWeight = isZero ? "normal" : "bold";
            let glowShadow = "none";
            let textGlow = "none";
            let borderColor = "transparent";
            let zIndex = 0;

            if (isDisabled) {
              textColor = "#52525b";
              fontWeight = "normal";
              if (isHighlighted) {
                bgColor = "rgba(82, 82, 91, 0.25)";
                textColor = "#a1a1aa";
                borderColor = "rgba(82, 82, 91, 0.5)";
              }
              if (isRangeSelected) {
                bgColor = "rgba(113, 113, 122, 0.35)";
                textColor = "#d4d4d8";
                borderColor = "rgba(113, 113, 122, 0.6)";
              }
            } else {
              if (isHighlighted) {
                bgColor = "rgba(59, 130, 246, 0.15)";
                textColor = "#93c5fd";
                fontWeight = "bold";
                borderColor = "rgba(59, 130, 246, 0.5)";
                glowShadow =
                  "0 0 12px rgba(59, 130, 246, 0.3), inset 0 0 6px rgba(59, 130, 246, 0.15)";
                textGlow = "0 0 8px rgba(59, 130, 246, 0.6)";
                zIndex = 10;
              }
              if (isRangeSelected) {
                bgColor = "rgba(139, 92, 246, 0.25)";
                textColor = "#c4b5fd";
                fontWeight = "bold";
                borderColor = "rgba(139, 92, 246, 0.6)";
                glowShadow = "0 0 12px rgba(139, 92, 246, 0.4)";
                textGlow = "0 0 8px rgba(139, 92, 246, 0.7)";
                zIndex = 20;
              }
            }

            return (
              <input
                key={globalIndex}
                type="text"
                value={byte}
                spellCheck="false"
                onMouseDown={() => onMouseDown(globalIndex)}
                onMouseEnter={() => onMouseEnter(globalIndex)}
                onChange={(e) => onByteChange(globalIndex, e.target.value)}
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
                  borderRadius: isHighlighted || isRangeSelected ? "4px" : "0",
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
                  cursor: "text",
                }}
                onFocus={(e) => {
                  if (isDisabled) {
                    e.target.style.backgroundColor = isRangeSelected
                      ? "rgba(113, 113, 122, 0.45)"
                      : isHighlighted
                      ? "rgba(82, 82, 91, 0.35)"
                      : "#27272a";
                    e.target.style.color = "#ffffff";
                    e.target.style.border = "1px solid #71717a";
                  } else {
                    e.target.style.backgroundColor = isRangeSelected
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
                  }
                  e.target.select();
                }}
                onBlur={(e) => {
                  e.target.style.backgroundColor = bgColor;
                  e.target.style.color = textColor;
                  e.target.style.border = `1px solid ${borderColor}`;
                  e.target.style.boxShadow = glowShadow;
                }}
              />
            );
          })}
        </div>

        {/* Decimal Representation */}
        <div
          className="hide-scrollbar"
          style={{
            marginLeft: "24px",
            maxWidth: "400px",
            overflowX: "auto",
            display: "flex",
            alignItems: "center",
            fontSize: "13px",
            paddingBottom: "2px",
            whiteSpace: "nowrap",
            color: isDisabled ? "#3f3f46" : "#71717a",
          }}
        >
          {isMultiple ? (
            <>
              32 *{" "}
              <span
                style={{
                  color: isDisabled ? "#3f3f46" : "#fbbf24",
                  fontWeight: isDisabled ? "normal" : "bold",
                  margin: "0 6px",
                }}
              >
                {factor}
              </span>{" "}
              = <span style={{ marginLeft: "6px" }}>{decString}</span>
            </>
          ) : (
            <span>{decString}</span>
          )}
        </div>
      </div>
    );
  },
  (prev, next) => {
    if (prev.rowIndex !== next.rowIndex) return false;
    if (prev.isDisabled !== next.isDisabled) return false;

    const offset = prev.rowIndex * 32;
    const endOffset = offset + 31;

    for (let i = 0; i < 32; i++) {
      if (prev.bytes[offset + i] !== next.bytes[offset + i]) return false;
    }

    const wasSelected =
      prev.selMin !== null && prev.selMin <= endOffset && prev.selMax >= offset;
    const isSelected =
      next.selMin !== null && next.selMin <= endOffset && next.selMax >= offset;
    if (wasSelected || isSelected) return false;

    const checkHighlight = (set) => {
      for (let i = offset; i <= endOffset; i++) if (set.has(i)) return true;
      return false;
    };
    if (checkHighlight(prev.highlightSet) || checkHighlight(next.highlightSet))
      return false;

    return true;
  }
);

// --- MAIN COMPONENT ---
const Component8 = () => {
  const [bytes, setBytes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [disabledRows, setDisabledRows] = useState({});

  // Selection States
  const [selectionStart, setSelectionStart] = useState(null);
  const [selectionEnd, setSelectionEnd] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectionCopied, setSelectionCopied] = useState(false);

  const isDraggingRef = useRef(false);

  const inputHex = useMemo(() => bytes.join(""), [bytes]);

  const hasRangeSelection =
    selectionStart !== null &&
    selectionEnd !== null &&
    selectionStart !== selectionEnd;
  const selMin = hasRangeSelection
    ? Math.min(selectionStart, selectionEnd)
    : null;
  const selMax = hasRangeSelection
    ? Math.max(selectionStart, selectionEnd)
    : null;

  const highlightSet = useMemo(() => {
    const set = new Set();
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
        for (let i = startByte; i <= endByte; i++) set.add(i);
        pos += 1;
      }
    }
    return set;
  }, [searchQuery, bytes]);

  // Global Mouse Up
  useEffect(() => {
    const handleMouseUp = () => {
      isDraggingRef.current = false;
      setIsDragging(false);
    };
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, []);

  const handleInputChange = useCallback((e) => {
    if (!e.target.value) {
      setBytes([]);
      setDisabledRows({});
    } else {
      setBytes(processHex(e.target.value));
    }
  }, []);

  const handleByteChange = useCallback((index, value) => {
    let cleaned = value.replace(/[^0-9a-fA-F]/g, "").toLowerCase();
    if (cleaned.length > 2) cleaned = cleaned.slice(-2);
    cleaned = cleaned.padStart(2, "0");

    setBytes((prev) => {
      const next = [...prev];
      next[index] = cleaned;
      return next;
    });
  }, []);

  const handleMouseDown = useCallback((index) => {
    isDraggingRef.current = true;
    setIsDragging(true);
    setSelectionStart(index);
    setSelectionEnd(index);
  }, []);

  const handleMouseEnter = useCallback((index) => {
    if (isDraggingRef.current) {
      setSelectionEnd(index);
      window.getSelection()?.removeAllRanges();
    }
  }, []);

  const toggleRow = useCallback((rowIndex) => {
    setDisabledRows((prev) => ({ ...prev, [rowIndex]: !prev[rowIndex] }));
  }, []);

  const handleCopy = () => {
    const textToCopy =
      inputHex.startsWith("0x") || inputHex === "" ? inputHex : `0x${inputHex}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const disableAllRows = () => {
    const totalRows = Math.ceil(bytes.length / 32);
    const allDisabled = {};
    for (let i = 0; i < totalRows; i++) allDisabled[i] = true;
    setDisabledRows(allDisabled);
  };

  const enableAllRows = () => setDisabledRows({});

  const setSelectionMuteState = (forceMute) => {
    if (!hasRangeSelection) return;
    const minRow = Math.floor(selMin / 32);
    const maxRow = Math.floor(selMax / 32);

    setDisabledRows((prev) => {
      const next = { ...prev };
      for (let i = minRow; i <= maxRow; i++) next[i] = forceMute;
      return next;
    });
    setSelectionStart(null);
    setSelectionEnd(null);
  };

  const handleDeleteSelection = () => {
    if (!hasRangeSelection) return;
    setBytes((prev) => {
      const next = [...prev];
      next.splice(selMin, selMax - selMin + 1);
      return next;
    });
    setSelectionStart(null);
    setSelectionEnd(null);
  };

  const handleCopySelection = () => {
    if (!hasRangeSelection) return;
    const selectedBytes = bytes.slice(selMin, selMax + 1).join("");
    navigator.clipboard.writeText(selectedBytes);
    setSelectionCopied(true);
    setTimeout(() => setSelectionCopied(false), 2000);
  };

  const totalRows = Math.ceil(bytes.length / 32);

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "#09090b",
        padding: "24px 12px",
        color: "#d4d4d8",
        fontFamily: "system-ui, -apple-system, sans-serif",
        boxSizing: "border-box",
        display: "block",
        position: "relative",
      }}
    >
      <style>
        {`
          .hide-scrollbar::-webkit-scrollbar { height: 4px; }
          .hide-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .hide-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 4px; }
        `}
      </style>

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
            {/* GLOBAL TOGGLES */}
            <div style={{ display: "flex", gap: "4px", marginRight: "8px" }}>
              <button
                onClick={enableAllRows}
                title="Enable All Rows"
                style={{
                  background: "transparent",
                  border: "1px solid #3f3f46",
                  color: "#10b981",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    border: "2px solid #10b981",
                  }}
                />
                Enable All
              </button>
              <button
                onClick={disableAllRows}
                title="Disable All Rows"
                style={{
                  background: "transparent",
                  border: "1px solid #3f3f46",
                  color: "#71717a",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: "#71717a",
                  }}
                />
                Disable All
              </button>
            </div>

            {/* SEARCH */}
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
                  color: "#60a5fa",
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

            {/* COPY CALLDATA */}
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
              padding: "24px 16px",
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
              {bytes.length > 0 ? (
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
                        width: TOGGLE_WIDTH,
                        minWidth: TOGGLE_WIDTH,
                        flexShrink: 0,
                      }}
                    ></div>
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
                        marginLeft: "24px",
                        color: "#52525b",
                        fontSize: "12px",
                        fontWeight: "bold",
                      }}
                    >
                      DECIMAL / MULTIPLE
                    </div>
                  </div>

                  {/* DATA ROWS */}
                  {Array.from({ length: totalRows }).map((_, rowIndex) => (
                    <HexRow
                      key={rowIndex}
                      rowIndex={rowIndex}
                      bytes={bytes}
                      isDisabled={!!disabledRows[rowIndex]}
                      selMin={selMin}
                      selMax={selMax}
                      highlightSet={highlightSet}
                      onByteChange={handleByteChange}
                      onMouseDown={handleMouseDown}
                      onMouseEnter={handleMouseEnter}
                      onToggleRow={toggleRow}
                    />
                  ))}
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

        {/* --- FLOATING TOOLTIP FOR DRAG SELECTION --- */}
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
                userSelect: "none",
              }}
            >
              Selected {Math.abs(selectionEnd - selectionStart) + 1} bytes
            </span>

            {/* DESTRUCTIVE ACTIONS */}
            <div
              style={{
                display: "flex",
                gap: "8px",
                borderRight: "1px solid #3f3f46",
                paddingRight: "16px",
              }}
            >
              <div
                role="button"
                tabIndex={0}
                onClick={handleDeleteSelection}
                title="Remove these bytes completely"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 16px",
                  backgroundColor: "#27272a",
                  color: "#ef4444",
                  border: "1px solid #3f3f46",
                  borderRadius: "999px",
                  fontSize: "13px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  userSelect: "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#3f3f46";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#27272a";
                }}
              >
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
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
                Delete
              </div>
            </div>

            {/* SELECTION ACTIONS */}
            <div
              style={{
                display: "flex",
                gap: "8px",
                borderRight: "1px solid #3f3f46",
                paddingRight: "16px",
              }}
            >
              <div
                role="button"
                tabIndex={0}
                onClick={handleCopySelection}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 16px",
                  backgroundColor: selectionCopied ? "#059669" : "#27272a",
                  color: "#ffffff",
                  border: "1px solid #3f3f46",
                  borderRadius: "999px",
                  fontSize: "13px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  userSelect: "none",
                }}
                onMouseEnter={(e) => {
                  if (!selectionCopied)
                    e.currentTarget.style.backgroundColor = "#3f3f46";
                }}
                onMouseLeave={(e) => {
                  if (!selectionCopied)
                    e.currentTarget.style.backgroundColor = "#27272a";
                }}
              >
                {selectionCopied ? "Copied!" : "Copy Hex"}
              </div>
            </div>

            {/* BULK TOGGLE ACTIONS */}
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <div
                role="button"
                tabIndex={0}
                onClick={() => setSelectionMuteState(false)}
                title="Enable selected rows"
                style={{
                  color: "#10b981",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  userSelect: "none",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    border: "2px solid #10b981",
                  }}
                />
                Enable
              </div>

              <div
                role="button"
                tabIndex={0}
                onClick={() => setSelectionMuteState(true)}
                title="Disable selected rows"
                style={{
                  color: "#71717a",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  userSelect: "none",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: "#71717a",
                  }}
                />
                Disable
              </div>
            </div>

            <div
              role="button"
              tabIndex={0}
              onClick={() => {
                setSelectionStart(null);
                setSelectionEnd(null);
              }}
              style={{
                color: "#71717a",
                cursor: "pointer",
                padding: "4px",
                marginLeft: "8px",
                display: "flex",
                alignItems: "center",
                userSelect: "none",
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Component8;
