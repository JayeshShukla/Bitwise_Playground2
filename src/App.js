// src/App.js
import React, { useState } from "react";
import Navbar from "./Navbar";
import Component1 from "./Component1";
import Component2 from "./Component2";
import Component3 from "./Component3";

const App = () => {
  const [activeComponent, setActiveComponent] = useState("component3");

  const renderComponent = () => {
    switch (activeComponent) {
      case "component1":
        return <Component1 />;
      case "component2":
        return <Component2 />;
      case "component3":
        return <Component3 />;
      default:
        return <Component3 />;
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
