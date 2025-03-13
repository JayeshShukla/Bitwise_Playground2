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
    </nav>
  );
};

export default Navbar;
