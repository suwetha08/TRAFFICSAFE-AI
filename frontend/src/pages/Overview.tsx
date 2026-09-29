import { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, Database, Crosshair, Zap } from 'lucide-react';

export default function Overview() {
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    axios.get('http://localhost:8000/api/metrics')
      .then(res => setMetrics(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-8">
      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-2">TRAFFICSAFE AI</h1>
        <p className="text-slate-400 text-lg">From accident data to explainable severity intelligence.</p>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-12">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <Database className="text-blue-500 w-8 h-8" />
            <span className="text-xs font-semibold px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full">Dataset</span>
          </div>
          <h2 className="text-3xl font-bold">{metrics?.total_rows ? metrics.total_rows.toLocaleString() : '---'}</h2>
          <p className="text-slate-400 text-sm mt-1">Total Accident Records</p>
        </div>
        
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <Activity className="text-green-500 w-8 h-8" />
            <span className="text-xs font-semibold px-2 py-1 bg-green-500/20 text-green-400 rounded-full">Features</span>
          </div>
          <h2 className="text-3xl font-bold">{metrics?.feature_count || '---'}</h2>
          <p className="text-slate-400 text-sm mt-1">Input Variables</p>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <Crosshair className="text-purple-500 w-8 h-8" />
            <span className="text-xs font-semibold px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full">Model</span>
          </div>
          <h2 className="text-3xl font-bold">{metrics?.accuracy ? (metrics.accuracy * 100).toFixed(1) + '%' : '---'}</h2>
          <p className="text-slate-400 text-sm mt-1">Overall Accuracy</p>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <Zap className="text-amber-500 w-8 h-8" />
            <span className="text-xs font-semibold px-2 py-1 bg-amber-500/20 text-amber-400 rounded-full">Performance</span>
          </div>
          <h2 className="text-3xl font-bold">{metrics?.f1_macro ? (metrics.f1_macro * 100).toFixed(1) + '%' : '---'}</h2>
          <p className="text-slate-400 text-sm mt-1">Macro F1 Score</p>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 p-8">
        <h2 className="text-xl font-bold mb-6">System Pipeline</h2>
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 right-0 h-1 bg-slate-700 top-1/2 -translate-y-1/2 z-0"></div>
          
          {['DATA', 'PREPROCESSING', 'FEATURE ENGINEERING', 'RANDOM FOREST', 'PREDICTION', 'EXPLAINABILITY'].map((step, i) => (
            <div key={i} className="relative z-10 flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-slate-900 border-2 border-blue-500 flex items-center justify-center mb-3">
                <span className="font-bold text-blue-400">{i + 1}</span>
              </div>
              <span className="text-xs font-semibold text-slate-300 w-24 text-center">{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
