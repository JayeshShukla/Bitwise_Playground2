import React, { useState, useEffect } from "react";

const formatString = (str) => {
  let cleanedStr = str;
  if (cleanedStr.startsWith("0x")) {
    cleanedStr = cleanedStr.slice(2);
  }

  const bytes = [];
  for (let i = 0; i < cleanedStr.length; i += 2) {
    bytes.push(cleanedStr.slice(i, i + 2));
  }

  const lines = [];
  for (let i = 0; i < bytes.length; i += 32) {
    lines.push(bytes.slice(i, i + 32));
  }

  return { lines, byteCount: bytes.length };
};

const Component1 = () => {
  const [inputString, setInputString] = useState("");
  const [localBytes, setLocalBytes] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  useEffect(() => {
    const { lines } = formatString(inputString);
    const bytes = lines.flat();
    setLocalBytes(bytes);
  }, [inputString]);

  const handleChange = (event) => {
    // Remove all white spaces from the input string
    const cleanedValue = event.target.value.replace(/\s+/g, "");
    setInputString(cleanedValue);
  };

  const handleByteChange = (index, newValue) => {
    const updatedBytes = [...localBytes];
    updatedBytes[index] = newValue;

    // Only update the main string if the byte is exactly two digits
    if (newValue.length === 2) {
      const newString = updatedBytes.join("");
      setInputString(`0x${newString}`);
    }

    setLocalBytes(updatedBytes);
    setEditIndex(index);
  };

  const { lines, byteCount } = formatString(inputString);

  return (
    <div style={{ fontFamily: "monospace" }}>
      <input
        type="text"
        placeholder="Paste the bytecode & to Edit it, double click the byte you wanna edit below"
        value={inputString}
        onChange={handleChange}
        style={{ width: "100%", marginBottom: "10px", fontFamily: "monospace" }}
      />
      <div>Total Bytes: {byteCount}</div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(32, 1fr)`,
          gap: "1px",
          alignItems: "center",
          marginBottom: "10px",
        }}
      >
        {Array.from({ length: 32 }).map((_, index) => (
          <div
            key={index}
            style={{
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            {index}
          </div>
        ))}
      </div>
      {lines.map((line, lineIndex) => (
        <div
          key={lineIndex}
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(32, 1fr)`,
            gap: "5px",
            marginBottom: "5px",
          }}
        >
          {line.map((byte, byteIndex) => (
            <input
              key={byteIndex}
              type="text"
              value={localBytes[lineIndex * 32 + byteIndex] || ""}
              onChange={(e) =>
                handleByteChange(lineIndex * 32 + byteIndex, e.target.value)
              }
              style={{
                width: "50px",
                textAlign: "center",
                color:
                  parseInt(
                    localBytes[lineIndex * 32 + byteIndex] || "00",
                    16
                  ) !== 0
                    ? "darkgreen"
                    : "rgba(0, 0, 0, 0.5)",
                border: "none",
                outline: "none",
                userSelect: "text", // Ensure text can be selected
                cursor: "text", // Show text cursor to indicate selectability
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default Component1;
