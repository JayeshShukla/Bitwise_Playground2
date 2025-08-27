import React, { useState, useRef, useEffect } from "react";
import * as math from "mathjs";
import katex from "katex";
import "katex/dist/katex.min.css";
import "./Component6.css";

const Component6 = () => {
  const [formula, setFormula] = useState("");
  const [displayFormula, setDisplayFormula] = useState("");
  const [variables, setVariables] = useState([]);
  const [values, setValues] = useState({});
  const [granularities, setGranularities] = useState({});
  const [patternVars, setPatternVars] = useState([]);
  const [outputs, setOutputs] = useState([]);
  const [showGraph, setShowGraph] = useState(false);
  const canvasRef = useRef(null);

  const handleFormulaChange = (e) => setFormula(e.target.value);

  const parseFormula = () => {
    try {
      const vars = [...new Set(formula.match(/[a-zA-Z_]\w*/g) || [])];
      setVariables(vars);
      const newValues = {};
      const newGrans = {};
      vars.forEach((v) => {
        newValues[v] = 100;
        newGrans[v] = 1;
      });
      setValues(newValues);
      setGranularities(newGrans);
      setPatternVars([]);
      setOutputs([]);
      setShowGraph(false);
      const html = katex.renderToString(formula, {
        throwOnError: false,
        output: "html",
      });
      setDisplayFormula(html);
      math.evaluate(formula, newValues);
    } catch (err) {
      alert("Invalid formula");
    }
  };

  const handleValueChange = (varName, newVal) => {
    const value = Math.max(-1000, Math.min(1000, parseFloat(newVal) || 0));
    setValues((prev) => ({ ...prev, [varName]: value }));
    if (outputs.length > 0) {
      generatePattern();
    }
  };

  const handleGranChange = (varName, newGran) => {
    const gran = parseFloat(newGran);
    if (gran > 0) {
      setGranularities((prev) => ({ ...prev, [varName]: gran }));
      if (outputs.length > 0) {
        generatePattern();
      }
    }
  };

  const togglePatternVar = (varName) => {
    setPatternVars((prev) => {
      if (prev.includes(varName)) {
        return prev.filter((v) => v !== varName);
      } else {
        return [...prev, varName];
      }
    });
    if (outputs.length > 0) {
      generatePattern();
    }
  };

  const generatePattern = () => {
    if (patternVars.length === 0) {
      setOutputs([]);
      return;
    }
    const fixedScope = {};
    variables.forEach((v) => {
      if (!patternVars.includes(v)) {
        fixedScope[v] = values[v];
      }
    });
    let newOutputs = [];
    const recurse = (index, currentScope) => {
      if (index === patternVars.length) {
        try {
          const result = math.evaluate(formula, currentScope);
          const inputs = {};
          patternVars.forEach((v) => {
            inputs[v] = currentScope[v];
          });
          newOutputs.push({ inputs, result });
        } catch (e) {}
        return;
      }
      const varName = patternVars[index];
      let val = values[varName];
      const end = 1000;
      const step = granularities[varName];
      if (step <= 0) return;
      while (val <= end) {
        recurse(index + 1, { ...currentScope, [varName]: val });
        val += step;
      }
    };
    recurse(0, fixedScope);
    setOutputs(newOutputs);
  };

  useEffect(() => {
    if (showGraph && canvasRef.current && outputs.length > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const width = canvas.width;
      const height = canvas.height;
      const padding = 50; // Space for axes, labels, and title
      ctx.clearRect(0, 0, width, height);

      const points = outputs.length;
      if (points === 0) return;

      // Get min and max for Y-axis (output values)
      let minY = Math.min(...outputs.map((o) => o.result));
      let maxY = Math.max(...outputs.map((o) => o.result));
      if (minY === maxY) {
        minY -= 1;
        maxY += 1;
      }
      const rangeY = maxY - minY;

      // Get min and max for X-axis (pattern variable values)
      const xValues = outputs.map((o) => Object.values(o.inputs)[0] || 0); // First pattern var
      const minX = Math.min(...xValues);
      const maxX = Math.max(...xValues);
      const rangeX = maxX - minX || 1;

      // Set up font and colors
      ctx.font = "12px Arial";
      ctx.fillStyle = "#e0e0e0"; // Light text for dark theme
      ctx.strokeStyle = "#e0e0e0";
      ctx.lineWidth = 1;

      // Draw title
      ctx.textAlign = "center";
      ctx.fillText(
        `Pattern for ${formula} (${patternVars.join(", ")})`,
        width / 2,
        20
      );

      // Draw X and Y axes
      ctx.beginPath();
      ctx.moveTo(padding, padding);
      ctx.lineTo(padding, height - padding);
      ctx.lineTo(width - padding, height - padding);
      ctx.stroke();

      // Draw Y-axis labels (output values)
      const yTicks = 5;
      for (let i = 0; i <= yTicks; i++) {
        const y = height - padding - (i * (height - 2 * padding)) / yTicks;
        const value = minY + (i * rangeY) / yTicks;
        ctx.fillText(value.toFixed(2), padding - 10, y + 5);
        ctx.beginPath();
        ctx.moveTo(padding - 5, y);
        ctx.lineTo(padding + 5, y);
        ctx.stroke();
        // Grid lines
        ctx.beginPath();
        ctx.strokeStyle = "#3b3b4f";
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
      }

      // Draw X-axis labels (pattern variable values)
      const xTicks = Math.min(points, 10); // Limit to avoid clutter
      for (let i = 0; i <= xTicks; i++) {
        const x = padding + (i * (width - 2 * padding)) / xTicks;
        const index = Math.floor((i * (points - 1)) / xTicks);
        const value = xValues[index] || minX;
        ctx.fillText(value.toFixed(2), x, height - padding + 15);
        ctx.beginPath();
        ctx.moveTo(x, height - padding - 5);
        ctx.lineTo(x, height - padding + 5);
        ctx.stroke();
        // Grid lines
        ctx.beginPath();
        ctx.strokeStyle = "#3b3b4f";
        ctx.moveTo(x, padding);
        ctx.lineTo(x, height - padding);
        ctx.stroke();
      }

      // Draw the data line
      ctx.beginPath();
      ctx.strokeStyle = "#4CAF50"; // Green line
      ctx.lineWidth = 2;
      for (let i = 0; i < points; i++) {
        const x = padding + (i / (points - 1)) * (width - 2 * padding);
        const y =
          height -
          padding -
          ((outputs[i].result - minY) / rangeY) * (height - 2 * padding);
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // Draw data point values (every nth point to avoid clutter)
      const labelInterval = Math.max(1, Math.floor(points / 10)); // Show ~10 labels
      for (let i = 0; i < points; i += labelInterval) {
        const x = padding + (i / (points - 1)) * (width - 2 * padding);
        const y =
          height -
          padding -
          ((outputs[i].result - minY) / rangeY) * (height - 2 * padding);
        ctx.fillText(outputs[i].result.toFixed(2), x + 10, y - 5);
        // Draw a small circle for the data point
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fillStyle = "#4CAF50";
        ctx.fill();
      }

      // Draw legend
      ctx.fillStyle = "#e0e0e0";
      ctx.fillText(
        `Output vs ${patternVars[0] || "Index"}`,
        width - padding,
        padding
      );
    }
  }, [showGraph, outputs, formula, patternVars]);

  const reset = () => {
    setFormula("");
    setDisplayFormula("");
    setVariables([]);
    setValues({});
    setGranularities({});
    setPatternVars([]);
    setOutputs([]);
    setShowGraph(false);
  };

  return (
    <div className="container">
      <h2>Pattern Visualizer</h2>
      <input
        type="text"
        value={formula}
        onChange={handleFormulaChange}
        placeholder="Enter formula, e.g., (a * b) / c"
        className="formula-input"
      />
      <button onClick={parseFormula} className="btn">
        Parse Formula
      </button>
      {displayFormula && (
        <div
          className="formula-display"
          dangerouslySetInnerHTML={{ __html: displayFormula }}
        />
      )}
      {variables.length > 0 && (
        <div className="variables-section">
          <h3>Variables</h3>
          {variables.map((v) => (
            <div key={v} className="var-control">
              <label>{v}</label>
              <input
                type="range"
                min="-1000"
                max="1000"
                step={granularities[v]}
                value={values[v]}
                onChange={(e) => handleValueChange(v, e.target.value)}
                className="slider"
              />
              <input
                type="number"
                value={values[v]}
                onChange={(e) => handleValueChange(v, e.target.value)}
                min="-1000"
                max="1000"
                className="number-input"
              />
              <label>Granularity:</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={granularities[v]}
                onChange={(e) => handleGranChange(v, e.target.value)}
              />
              <label>Pattern Var:</label>
              <input
                type="checkbox"
                checked={patternVars.includes(v)}
                onChange={() => togglePatternVar(v)}
              />
            </div>
          ))}
          <button onClick={generatePattern} className="btn">
            Generate Pattern
          </button>
        </div>
      )}
      {outputs.length > 0 && (
        <div className="outputs-section">
          <h3>Pattern Outputs</h3>
          <ul>
            {outputs.map((o, i) => (
              <li key={i}>
                {JSON.stringify(o.inputs)}: {o.result}
              </li>
            ))}
          </ul>
        </div>
      )}
      {outputs.length > 0 && (
        <button onClick={() => setShowGraph(!showGraph)} className="btn">
          {showGraph ? "Hide Graph" : "Show Graph"}
        </button>
      )}
      {showGraph && (
        <canvas
          ref={canvasRef}
          width="600"
          height="400"
          className="graph-canvas"
        />
      )}
      <button onClick={reset} className="btn reset">
        Reset
      </button>
    </div>
  );
};

export default Component6;
