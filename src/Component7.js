import React, { useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import './Component7.css';

const Component7 = () => {
  const [programId, setProgramId] = useState('');
  const [seeds, setSeeds] = useState([{ id: Date.now(), type: 'string', value: '' }]);
  const [result, setResult] = useState({ pda: null, bump: null, error: null });

  // Helper: Convert inputs to Uint8Array (Buffer compatible)
  const processSeed = (seed) => {
    try {
      if (seed.type === 'string') {
        return new TextEncoder().encode(seed.value);
      } 
      else if (seed.type === 'u64') {
        // Convert number to 8-byte Little Endian Uint8Array
        const buffer = new ArrayBuffer(8);
        // Use BigInt to handle large numbers safely
        new DataView(buffer).setBigUint64(0, BigInt(seed.value), true); // true = Little Endian
        return new Uint8Array(buffer);
      } 
      else if (seed.type === 'u8') {
        return new Uint8Array([parseInt(seed.value)]);
      }
      else if (seed.type === 'publicKey') {
        return new PublicKey(seed.value).toBuffer();
      }
      throw new Error('Unknown type');
    } catch (err) {
      throw new Error(`Invalid value for ${seed.type}: "${seed.value}"`);
    }
  };

  const handleCalculate = () => {
    setResult({ pda: null, bump: null, error: null });

    try {
      if (!programId) throw new Error("Program ID is required");

      const pubKeyProgramId = new PublicKey(programId);
      
      // Process all seeds
      const processedSeeds = seeds.map(processSeed);

      // Find Address
      const [pda, bump] = PublicKey.findProgramAddressSync(
        processedSeeds,
        pubKeyProgramId
      );

      setResult({ pda: pda.toBase58(), bump: bump, error: null });

    } catch (err) {
      setResult({ pda: null, bump: null, error: err.message });
    }
  };

  const addSeed = () => {
    setSeeds([...seeds, { id: Date.now(), type: 'string', value: '' }]);
  };

  const removeSeed = (id) => {
    setSeeds(seeds.filter(s => s.id !== id));
  };

  const updateSeed = (id, field, val) => {
    setSeeds(seeds.map(s => s.id === id ? { ...s, [field]: val } : s));
  };

  return (
    <div className="component7-container">
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
        <button onClick={addSeed} className="component7-btn-add">+ Add Seed</button>
      </div>

      <div className="component7-seeds-list">
        {seeds.map((seed, index) => (
          <div key={seed.id} className="component7-seed-row">
            <span className="component7-index">#{index + 1}</span>
            
            <select 
              value={seed.type} 
              onChange={(e) => updateSeed(seed.id, 'type', e.target.value)}
              className="component7-select"
            >
              <option value="string">String (b"val")</option>
              <option value="u64">u64 (Little Endian)</option>
              <option value="u8">u8 (Byte)</option>
              <option value="publicKey">PublicKey</option>
            </select>

            <input 
              type="text" 
              placeholder={seed.type === 'u64' ? '123' : 'value'}
              value={seed.value}
              onChange={(e) => updateSeed(seed.id, 'value', e.target.value)}
              className="component7-input component7-seed-input"
            />

            <button onClick={() => removeSeed(seed.id)} className="component7-btn-del">×</button>
          </div>
        ))}
      </div>

      <button onClick={handleCalculate} className="component7-btn-calc">
        Derive Address
      </button>

      {result.error && <div className="component7-error">{result.error}</div>}

      {result.pda && (
        <div className="component7-result">
          <div className="component7-result-item">
            <span className="component7-label">PDA Address:</span>
            <span className="component7-value component7-highlight">{result.pda}</span>
          </div>
          <div className="component7-result-item">
            <span className="component7-label">Bump:</span>
            <span className="component7-value">{result.bump}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Component7;