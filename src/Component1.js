// src/Component1.js
import React, { useState } from "react";

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
    lines.push(bytes.slice(i, i + 32).join(" "));
  }

  return { lines, byteCount: bytes.length };
};

const Component1 = () => {
  const [inputString, setInputString] = useState("");

  const handleChange = (event) => {
    setInputString(event.target.value);
  };

  const { lines, byteCount } = formatString(inputString);

  const isNonZero = (byte) => {
    return parseInt(byte, 16) !== 0;
  };

  return (
    <div style={{ fontFamily: "monospace" }}>
      <input
        type="text"
        placeholder="Enter a hex string"
        value={inputString}
        onChange={handleChange}
        style={{ width: "100%", marginBottom: "10px", fontFamily: "monospace" }}
      />
      <div>Total Bytes: {byteCount}</div>
      <div style={{ whiteSpace: "pre" }}>
        {lines.map((line, index) => (
          <div key={index}>
            {line.match(/.{1,2}/g).map((byte, idx) => (
              <span
                key={idx}
                style={{
                  color: isNonZero(byte) ? "darkgreen" : "rgba(0, 0, 0, 0.5)",
                }}
              >
                {byte}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Component1;
