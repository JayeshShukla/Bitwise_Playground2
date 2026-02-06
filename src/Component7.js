import React, { useState } from "react";
import { PublicKey } from "@solana/web3.js";
import "./Component7.css";

const Component7 = () => {
  // ==========================================
  // LEFT SIDE: PDA CALCULATOR STATE
  // ==========================================
  const [programId, setProgramId] = useState("");
  const [seeds, setSeeds] = useState([
    { id: Date.now(), type: "string", value: "" },
  ]);
  const [pdaResult, setPdaResult] = useState({
    pda: null,
    bump: null,
    error: null,
  });

  // ==========================================
  // RIGHT SIDE: INSTRUCTION SERIALIZER STATE
  // ==========================================
  const [rustSignature, setRustSignature] = useState(`pub fn create_offer(
    ctx: Context<CreateOffer>,
    offer_amount: u64,
    offer_name: String,
) -> Result<()> {`);

  const [parsedFunc, setParsedFunc] = useState(null);
  const [argValues, setArgValues] = useState({});
  const [serializerResult, setSerializerResult] = useState(null);
  const [serializerError, setSerializerError] = useState(null);

  // ==========================================
  // SHARED LOGIC
  // ==========================================
  const sha256 = async (message) => {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    return new Uint8Array(hashBuffer);
  };

  // ==========================================
  // PDA LOGIC
  // ==========================================
  const processSeed = (seed) => {
    try {
      if (seed.type === "string") return new TextEncoder().encode(seed.value);
      if (seed.type === "u64") {
        const buffer = new ArrayBuffer(8);
        new DataView(buffer).setBigUint64(0, BigInt(seed.value), true);
        return new Uint8Array(buffer);
      }
      if (seed.type === "u8") return new Uint8Array([parseInt(seed.value)]);
      if (seed.type === "publicKey")
        return new PublicKey(seed.value).toBuffer();
      throw new Error("Unknown type");
    } catch (err) {
      throw new Error(`Invalid value for ${seed.type}: "${seed.value}"`);
    }
  };

  const handleCalculatePda = () => {
    setPdaResult({ pda: null, bump: null, error: null });
    try {
      if (!programId) throw new Error("Program ID is required");
      const pubKeyProgramId = new PublicKey(programId);
      const processedSeeds = seeds.map(processSeed);
      const [pda, bump] = PublicKey.findProgramAddressSync(
        processedSeeds,
        pubKeyProgramId
      );
      setPdaResult({ pda: pda.toBase58(), bump: bump, error: null });
    } catch (err) {
      setPdaResult({ pda: null, bump: null, error: err.message });
    }
  };

  const addSeed = () =>
    setSeeds([...seeds, { id: Date.now(), type: "string", value: "" }]);
  const removeSeed = (id) => setSeeds(seeds.filter((s) => s.id !== id));
  const updateSeed = (id, field, val) =>
    setSeeds(seeds.map((s) => (s.id === id ? { ...s, [field]: val } : s)));

  // ==========================================
  // SERIALIZER LOGIC
  // ==========================================
  const parseRustSignature = () => {
    setSerializerError(null);
    setSerializerResult(null);
    try {
      const nameMatch = rustSignature.match(/fn\s+(\w+)\s*\(/);
      if (!nameMatch) throw new Error("Could not find function name");
      const funcName = nameMatch[1];

      const argsMatch = rustSignature.match(/\(([\s\S]*?)\)/);
      if (!argsMatch) throw new Error("Could not find arguments");

      const rawArgs = argsMatch[1]
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s);
      const args = [];

      rawArgs.forEach((arg) => {
        if (!arg || arg.startsWith("//")) return;
        const [namePart, typePart] = arg.split(":").map((s) => s.trim());
        if (!namePart || !typePart) return;
        if (typePart.startsWith("Context")) return;
        args.push({ name: namePart, type: typePart });
      });

      setParsedFunc({ name: funcName, args });
      const initialValues = {};
      args.forEach((a) => (initialValues[a.name] = ""));
      setArgValues(initialValues);
    } catch (err) {
      setSerializerError(err.message);
    }
  };

  const serializeData = async () => {
    setSerializerError(null);
    try {
      if (!parsedFunc) return;
      const discriminatorPreimage = `global::${parsedFunc.name}`;
      const hash = await sha256(discriminatorPreimage);
      const discriminator = Array.from(hash.slice(0, 8));

      let serializedArgs = [];
      for (const arg of parsedFunc.args) {
        const val = argValues[arg.name];
        const type = arg.type;
        let bytes = [];

        if (type === "u8") {
          bytes = [parseInt(val)];
        } else if (
          ["u16", "u32", "u64", "u128", "i16", "i32", "i64"].includes(type)
        ) {
          const sizeMap = {
            u16: 2,
            i16: 2,
            u32: 4,
            i32: 4,
            u64: 8,
            i64: 8,
            u128: 16,
          };
          const size = sizeMap[type] || 8;
          const buffer = new ArrayBuffer(size);
          const view = new DataView(buffer);
          const bigVal = BigInt(val);

          if (size === 2) view.setUint16(0, Number(bigVal), true);
          if (size === 4) view.setUint32(0, Number(bigVal), true);
          if (size === 8) view.setBigUint64(0, bigVal, true);
          bytes = Array.from(new Uint8Array(buffer));
        } else if (type === "String") {
          const strBytes = new TextEncoder().encode(val);
          const lenBuffer = new ArrayBuffer(4);
          new DataView(lenBuffer).setUint32(0, strBytes.length, true);
          bytes = [...new Uint8Array(lenBuffer), ...strBytes];
        } else if (type === "PublicKey") {
          bytes = Array.from(new PublicKey(val).toBuffer());
        } else if (type === "bool") {
          bytes = [val === "true" || val === true ? 1 : 0];
        } else {
          throw new Error(`Unsupported type: ${type}`);
        }
        serializedArgs = [...serializedArgs, ...bytes];
      }
      setSerializerResult({ discriminator, args: serializedArgs });
    } catch (err) {
      setSerializerError("Serialization Failed: " + err.message);
    }
  };

  return (
    <div className="component7-dashboard">
      {/* ======================= CARD 1: PDA CALCULATOR ======================= */}
      <div className="component7-card">
        <h2 className="component7-title">Solana PDA Calculator</h2>

        <div className="component7-group">
          <label>Program ID</label>
          <input
            type="text"
            placeholder="e.g. 4hCu..."
            value={programId}
            onChange={(e) => setProgramId(e.target.value)}
            className="component7-input"
          />
        </div>

        <div className="component7-seeds-header">
          <label>Seeds</label>
          <button onClick={addSeed} className="component7-btn-add">
            + Add Seed
          </button>
        </div>

        <div className="component7-seeds-list">
          {seeds.map((seed, index) => (
            <div key={seed.id} className="component7-seed-row">
              <span className="component7-index">#{index + 1}</span>
              <select
                value={seed.type}
                onChange={(e) => updateSeed(seed.id, "type", e.target.value)}
                className="component7-select"
              >
                <option value="string">String</option>
                <option value="u64">u64 (LE)</option>
                <option value="u8">u8</option>
                <option value="publicKey">PublicKey</option>
              </select>
              <input
                type="text"
                value={seed.value}
                onChange={(e) => updateSeed(seed.id, "value", e.target.value)}
                className="component7-input component7-seed-input"
              />
              <button
                onClick={() => removeSeed(seed.id)}
                className="component7-btn-del"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <button onClick={handleCalculatePda} className="component7-btn-calc">
          Derive Address
        </button>

        {pdaResult.error && (
          <div className="component7-error">{pdaResult.error}</div>
        )}

        {pdaResult.pda && (
          <div className="component7-result">
            <div className="component7-result-item">
              <span className="component7-label">PDA:</span>
              <span className="component7-value component7-highlight">
                {pdaResult.pda}
              </span>
            </div>
            <div className="component7-result-item">
              <span className="component7-label">Bump:</span>
              <span className="component7-value">{pdaResult.bump}</span>
            </div>
          </div>
        )}
      </div>

      {/* ======================= CARD 2: SERIALIZER ======================= */}
      <div className="component7-card">
        <h2 className="component7-title">Anchor Data Serializer</h2>

        <div className="component7-group">
          <label>Paste Rust Function Signature</label>
          <textarea
            className="component7-textarea"
            rows={5}
            value={rustSignature}
            onChange={(e) => setRustSignature(e.target.value)}
          />
        </div>

        <button
          onClick={parseRustSignature}
          className="component7-btn-secondary"
        >
          1. Parse Function
        </button>

        {serializerError && (
          <div className="component7-error">{serializerError}</div>
        )}

        {parsedFunc && (
          <div className="component7-args-section">
            <div className="component7-sub-header">
              Arguments for:{" "}
              <span className="component7-highlight">{parsedFunc.name}</span>
            </div>

            {parsedFunc.args.length === 0 ? (
              <p
                style={{
                  color: "#888",
                  fontStyle: "italic",
                  marginBottom: "15px",
                }}
              >
                No arguments found
              </p>
            ) : (
              parsedFunc.args.map((arg, idx) => (
                <div key={idx} className="component7-group">
                  <label>
                    {arg.name}{" "}
                    <span className="component7-type-badge">{arg.type}</span>
                  </label>
                  <input
                    type="text"
                    className="component7-input"
                    placeholder={`Enter ${arg.type}`}
                    value={argValues[arg.name]}
                    onChange={(e) =>
                      setArgValues({ ...argValues, [arg.name]: e.target.value })
                    }
                  />
                </div>
              ))
            )}

            <button onClick={serializeData} className="component7-btn-calc">
              2. Generate Payload
            </button>
          </div>
        )}

        {serializerResult && (
          <div className="component7-result">
            <div className="component7-result-item">
              <span className="component7-label">Discriminator (8 bytes):</span>
              <div className="component7-byte-array">
                [{serializerResult.discriminator.join(", ")}]
              </div>
            </div>

            <div className="component7-result-item">
              <span className="component7-label">Argument Data:</span>
              <div className="component7-byte-array">
                [{serializerResult.args.join(", ")}]
              </div>
            </div>

            <div className="component7-result-item">
              <span className="component7-label">Total Payload (Raw):</span>
              <div
                className="component7-byte-array"
                style={{ color: "#4caf50" }}
              >
                [
                {[
                  ...serializerResult.discriminator,
                  ...serializerResult.args,
                ].join(", ")}
                ]
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Component7;
