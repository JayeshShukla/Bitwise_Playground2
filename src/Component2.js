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

  const handleNumberChange = (e) => {
    setNumber(e.target.value);
    setShiftedNumber("");
  };

  const handleShiftChange = (e) => {
    setShift(parseInt(e.target.value, 10));
  };

  const handleShiftDirectionChange = (e) => {
    setShiftDirection(e.target.value);
  };

  const handleReset = () => {
    setNumber("");
    setShift(0);
    setShiftDirection("left");
    setErrorMessage("");
    setShiftedNumber("");
    setInstructions([]);
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
    const shiftAmount = BigInt(shift); // shift amount in bits

    let result;
    if (shiftDirection === "left") {
      result = num << shiftAmount;
      result =
        result &
        BigInt(
          "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
        ); // Keep only the lower 256 bits
    } else {
      result = num >> shiftAmount;
    }

    return padTo256Bits(result.toString(16));
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

    // Update shifted number state
    setShiftedNumber(shiftedResult);
    setErrorMessage("");
  };

  const highlightLast20Bytes = (numStr) => {
    if (!numStr) return "";
    const last20Bytes = numStr.slice(-40);
    const remainingStr = numStr.slice(0, -40);
    return (
      <span>
        {remainingStr}
        <span className="red-box">{last20Bytes}</span>
      </span>
    );
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Bit Shift Visualizer</h1>
        <div>
          <label>
            Number (Hex):
            <input
              type="text"
              value={number}
              onChange={handleNumberChange}
              placeholder="e.g., 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
            />
          </label>
        </div>
        <div>
          <label>
            Shift Amount (Bits):
            <input type="number" value={shift} onChange={handleShiftChange} />
          </label>
        </div>
        <div>
          <label>
            Direction:
            <select
              value={shiftDirection}
              onChange={handleShiftDirectionChange}
            >
              <option value="left">Left</option>
              <option value="right">Right</option>
            </select>
          </label>
        </div>
        <button onClick={handleCalculate}>Calculate</button>
        <button onClick={handleReset}>Reset</button>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <div>
          <h2>Original Number</h2>
          <p>0x{highlightLast20Bytes(padTo256Bits(number.slice(2)))}</p>
        </div>
        <div>
          <h2>Shifted Result</h2>
          <p>0x{highlightLast20Bytes(shiftedNumber)}</p>
        </div>
        <div>
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
