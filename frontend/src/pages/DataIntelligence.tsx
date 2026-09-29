import { useState, useEffect } from 'react';
import axios from 'axios';

export default function DataIntelligence() {
  const [dataInfo, setDataInfo] = useState<any>(null);

  useEffect(() => {
    // We will fetch EDA info here later
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Data Intelligence</h1>
      
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
        <h2 className="text-xl font-bold mb-4">Dataset Overview</h2>
        <p className="text-slate-400">Loading dataset statistics...</p>
      </div>
    </div>
  );
}
