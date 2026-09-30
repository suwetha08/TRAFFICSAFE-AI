import { useState } from 'react';
import axios from 'axios';
import { Settings, Save, Check } from 'lucide-react';

export default function SystemSettings() {
  const [w, setW] = useState({ vehicle: 0.30, weather: 0.20, traffic: 0.15, accident: 0.15, near_miss: 0.20 });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    axios.post('http://localhost:8000/api/settings', w).then(() => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-100 flex items-center space-x-3">
          <Settings className="w-8 h-8 text-cyan-400" />
          <span>System Settings</span>
        </h1>
        <p className="text-slate-400 mt-1">Configure CARF weights and simulation parameters</p>
      </div>

      <div className="bg-card1 p-6 rounded-xl border border-card2">
        <h2 className="text-sm font-bold text-slate-200 uppercase tracking-widest mb-6 border-b border-card2 pb-2">CARF Weights Configuration</h2>
        <div className="space-y-4">
          {Object.entries(w).map(([key, val]) => (
            <div key={key} className="flex items-center justify-between">
              <label className="text-sm text-slate-300 capitalize">{key.replace('_', ' ')} Component Weight (α, β, γ...)</label>
              <div className="flex items-center space-x-3">
                <input 
                  type="range" min="0" max="1" step="0.05" value={val} 
                  onChange={(e) => setW({...w, [key]: parseFloat(e.target.value)})}
                  className="w-48 accent-cyan-500" 
                />
                <span className="font-mono text-cyan-400 w-12 text-right">{val.toFixed(2)}</span>
              </div>
            </div>
          ))}
          <div className="pt-6 border-t border-card2 mt-6 flex justify-end">
            <button onClick={handleSave} className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2 rounded shadow transition flex items-center space-x-2">
              {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{saved ? 'Saved' : 'Save Weights'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-card1 p-6 rounded-xl border border-card2">
        <h2 className="text-sm font-bold text-slate-200 uppercase tracking-widest mb-6 border-b border-card2 pb-2">Risk Thresholds (Prototype)</h2>
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-bg2 p-4 rounded border border-card2 text-center">
            <p className="text-xs text-slate-400 uppercase mb-1">Low</p>
            <p className="font-mono text-green-400 font-bold">0 - 25</p>
          </div>
          <div className="bg-bg2 p-4 rounded border border-card2 text-center">
            <p className="text-xs text-slate-400 uppercase mb-1">Moderate</p>
            <p className="font-mono text-yellow-500 font-bold">26 - 50</p>
          </div>
          <div className="bg-bg2 p-4 rounded border border-card2 text-center">
            <p className="text-xs text-slate-400 uppercase mb-1">High</p>
            <p className="font-mono text-orange-500 font-bold">51 - 75</p>
          </div>
          <div className="bg-bg2 p-4 rounded border border-card2 text-center">
            <p className="text-xs text-slate-400 uppercase mb-1">Critical</p>
            <p className="font-mono text-red-500 font-bold">76 - 100</p>
          </div>
        </div>
      </div>

      <div className="bg-card1 p-6 rounded-xl border border-card2">
        <h2 className="text-sm font-bold text-slate-200 uppercase tracking-widest mb-6 border-b border-card2 pb-2">Application Settings</h2>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-slate-300">Theme</span>
          <select className="bg-bg2 border border-card2 text-slate-300 text-sm rounded px-3 py-1 outline-none">
            <option>Dark Mode (Default)</option>
          </select>
        </div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-slate-300">Simulation Speed</span>
          <select className="bg-bg2 border border-card2 text-slate-300 text-sm rounded px-3 py-1 outline-none">
            <option>Normal (1x)</option>
            <option>Fast (2x)</option>
          </select>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-300">Demo Mode</span>
          <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded font-bold">ON</span>
        </div>
      </div>
    </div>
  );
}
