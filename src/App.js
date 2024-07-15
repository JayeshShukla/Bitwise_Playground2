// src/App.js
import React, { useState } from "react";
import Navbar from "./Navbar";
import Component1 from "./Component1";
import Component2 from "./Component2";

const App = () => {
  const [activeComponent, setActiveComponent] = useState("component1");

  const renderComponent = () => {
    switch (activeComponent) {
      case "component1":
        return <Component1 />;
      case "component2":
        return <Component2 />;
      default:
        return <Component1 />;
    }
  };

  return (
    <div>
      <Navbar setActiveComponent={setActiveComponent} />
      <div>{renderComponent()}</div>
    </div>
  );
};

export default App;
