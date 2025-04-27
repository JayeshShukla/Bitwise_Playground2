// src/Component2.js
import React, { useState } from "react";
import "./Component2.css";

const Component2 = () => {
  const [number, setNumber] = useState("");
  const [shift, setShift] = useState(0);
  const [shiftDirection, setShiftDirection] = useState("left");
  const [errorMessage, setErrorMessage] = useState("");
  const [shiftedNumber, setShiftedNumber] = useState("");
  const [instructions, setInstructions] = useState([]);
  const [highlightBytes, setHighlightBytes] = useState(20);
  const [executedData, setExecutedData] = useState([]);

  const handleNumberChange = (e) => {
    setNumber(e.target.value);
    setShiftedNumber("");
    setExecutedData([]);
  };

  const handleShiftChange = (e) => {
    setShift(parseInt(e.target.value, 10));
  };

  const handleShiftDirectionChange = (e) => {
    setShiftDirection(e.target.value);
  };

  const handleHighlightBytesChange = (e) => {
    setHighlightBytes(parseInt(e.target.value, 10));
  };

  const handleReset = () => {
    setNumber("");
    setShift(0);
    setShiftDirection("left");
    setErrorMessage("");
    setShiftedNumber("");
    setInstructions([]);
    setHighlightBytes(20);
    setExecutedData([]);
  };

  const isValidHex = (str) => {
    const regex = /^0x[0-9a-fA-F]+$/;
    return regex.test(str);
  };

  const padTo256Bits = (hexStr) => {
    return hexStr.padStart(64, "0");
  };

  const calculateShiftedNumber = (inputNumber) => {
    const num = BigInt(inputNumber);
    const shiftAmount = BigInt(shift);

    let result;
    if (shiftDirection === "left") {
      result = num << shiftAmount;
      result =
        result &
        BigInt(
          "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
        );
    } else {
      result = num >> shiftAmount;
    }

    return padTo256Bits(result.toString(16));
  };

  const hexToUint = (hexString) => {
    if (!hexString) return "0";
    return BigInt("0x" + hexString).toString(10);
  };

  const highlightLastNBytes = (numStr) => {
    if (!numStr) return "";
    const hexCharsToHighlight = highlightBytes * 2;
    const lastNChars = numStr.slice(-hexCharsToHighlight);
    const remainingStr = numStr.slice(0, -hexCharsToHighlight);

    return (
      <span>
        {remainingStr}
        <span className="red-box">{lastNChars}</span>
      </span>
    );
  };

  const prepareExecutionData = (numHex) => {
    const paddedHex = padTo256Bits(numHex.slice(2));
    const fullUint = hexToUint(paddedHex);
    const lastNBytesHex = paddedHex.slice(-highlightBytes * 2);
    const lastNBytesUint = hexToUint(lastNBytesHex);

    return { paddedHex, fullUint, lastNBytesHex, lastNBytesUint };
  };

  const handleCalculate = () => {
    if (!isValidHex(number)) {
      setErrorMessage("Invalid hexadecimal number");
      return;
    }

    const baseNumber = shiftedNumber ? `0x${shiftedNumber}` : number;
    const shiftedResult = calculateShiftedNumber(baseNumber);

    if (!shiftedResult) {
      return;
    }

    const newInstruction = `Shift ${shift} bits to the ${shiftDirection}, resulting in 0x${shiftedResult}`;
    setInstructions((prevInstructions) => [
      ...prevInstructions,
      newInstruction,
    ]);
    setShiftedNumber(shiftedResult);
    setErrorMessage("");

    const data = prepareExecutionData(`0x${shiftedResult}`);
    setExecutedData((prevData) => [...prevData, data]);
  };

  const currentOriginalData = prepareExecutionData(number || "0x0");

  return (
    <div className="App">
      <header className="App-header">
        <h1>Bit Shift Visualizer</h1>

        <div className="form-section">
          <div className="form-group">
            <label>Number (Hex)</label>
            <input
              type="text"
              value={number}
              onChange={handleNumberChange}
              placeholder="e.g., 0x12345678..."
            />
          </div>

          <div className="form-group">
            <label>Shift Amount (Bits)</label>
            <input type="number" value={shift} onChange={handleShiftChange} />
          </div>

          <div className="form-group">
            <label>Direction</label>
            <select
              value={shiftDirection}
              onChange={handleShiftDirectionChange}
            >
              <option value="left">Left</option>
              <option value="right">Right</option>
            </select>
          </div>

          <div className="form-group">
            <label>Highlight</label>
            <select
              value={highlightBytes}
              onChange={handleHighlightBytesChange}
            >
              <option value={2}>2 bytes (16 bits)</option>
              <option value={4}>4 bytes (32 bits)</option>
              <option value={8}>8 bytes (64 bits)</option>
              <option value={16}>16 bytes (128 bits)</option>
              <option value={20}>20 bytes (160 bits)</option>
              <option value={32}>32 bytes (256 bits)</option>
            </select>
          </div>

          <div className="button-group">
            <button onClick={handleCalculate}>Calculate</button>
            <button onClick={handleReset}>Reset</button>
          </div>
        </div>

        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <div className="result-section">
          <h2>Original Number</h2>
          <p className="hex-display">
            0x{highlightLastNBytes(currentOriginalData.paddedHex)}
          </p>
          <div className="value-group">
            <div className="value-block">
              <label>Full Uint256</label>
              <p>{currentOriginalData.fullUint}</p>
            </div>
            <div className="value-block">
              <label>Highlighted Uint ({highlightBytes} bytes)</label>
              <p>{currentOriginalData.lastNBytesUint}</p>
            </div>
          </div>
        </div>

        {executedData.length > 0 && (
          <div className="result-section">
            <h2>Shifted Results</h2>
            {executedData.map((data, index) => (
              <div key={index} className="shift-block">
                <h3>Shift #{index + 1}</h3>
                <p className="hex-display">
                  0x{highlightLastNBytes(data.paddedHex)}
                </p>
                <div className="value-group">
                  <div className="value-block">
                    <label>Full Uint256</label>
                    <p>{data.fullUint}</p>
                  </div>
                  <div className="value-block">
                    <label>Highlighted Uint ({highlightBytes} bytes)</label>
                    <p>{data.lastNBytesUint}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="instructions-section">
          <h2>Executed Instructions</h2>
          <ul>
            {instructions.map((instruction, index) => (
              <li key={index}>{instruction}</li>
            ))}
          </ul>
        </div>
      </header>
    </div>
  );
};

export default Component2;
