// src/App.js
import React, { useState } from "react";
import Navbar from "./Navbar";
import Component1 from "./Component1";
import Component2 from "./Component2";
import Component3 from "./Component3";
import Component4 from "./Component4";
import Component5 from "./Component5";
import Component6 from "./Component6";
import Component7 from "./Component7";

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
      case "component4":
        return <Component4 />;
      case "component5":
        return <Component5 />;
      case "component6":
        return <Component6 />;
      case "component7" :
        return <Component7 />;
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
