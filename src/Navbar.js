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
        Component 1
      </button>
      <button
        className="navbar-button"
        onClick={() => setActiveComponent("component2")}
      >
        Component 2
      </button>
    </nav>
  );
};

export default Navbar;
