// src/Navbar.js
import React from "react";
import "./Navbar.css";

const Navbar = ({ setActiveComponent }) => {
  return (
    <nav className="navbar">
      <button
        className="navbar-button"
        onClick={() => setActiveComponent("component1")}
      >
        Play with Bytes32
      </button>
      <button
        className="navbar-button"
        onClick={() => setActiveComponent("component2")}
      >
        Bit Shifter
      </button>
      <button
        className="navbar-button"
        onClick={() => setActiveComponent("component3")}
      >
        Contract Storage
      </button>
      <button
        className="navbar-button"
        onClick={() => setActiveComponent("component4")}
      >
        Play with Binary
      </button>
      <button
        className="navbar-button"
        onClick={() => setActiveComponent("component5")}
      >
        Advanced Converter
      </button>
      <button
        className="navbar-button"
        onClick={() => setActiveComponent("component6")}
      >
        Rust Notes
      </button>
    </nav>
  );
};

export default Navbar;
