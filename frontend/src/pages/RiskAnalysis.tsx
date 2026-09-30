import { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity } from 'lucide-react';

export default function RiskAnalysis() {
  const [state, setState] = useState<any>(null);

  useEffect(() => {
    const fetch = () => axios.get('http://localhost:8000/api/state').then(res => setState(res.data)).catch(()=>{});
    fetch();
    const interval = setInterval(fetch, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!state) return <div className="p-8 text-slate-500">Loading risk data...</div>;
  const risk = state.risk;

  const getRiskColor = (cls: string) => {
    if(cls === 'CRITICAL') return 'text-red-500 border-red-500';
    if(cls === 'HIGH') return 'text-orange-500 border-orange-500';
    if(cls === 'MODERATE') return 'text-yellow-500 border-yellow-500';
    return 'text-green-500 border-green-500';
  };

  const color = getRiskColor(risk.classification);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Context-Aware Risk Analysis</h1>
        <p className="text-slate-400 mt-1">Real-time Multimodal Risk Fusion Engine (CARF)</p>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div className="bg-card1 p-8 rounded-2xl border border-card2 flex flex-col items-center justify-center relative">
          <Activity className="absolute top-4 left-4 w-6 h-6 text-slate-600" />
          <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mb-4">CARF Risk Score</p>
          <div className={`w-64 h-64 rounded-full border-8 ${color.split(' ')[1]} flex flex-col items-center justify-center shadow-2xl`}>
            <span className={`text-6xl font-black ${color.split(' ')[0]}`}>{risk.total.toFixed(1)}%</span>
          </div>
          <p className={`mt-6 text-2xl font-bold tracking-widest ${color.split(' ')[0]}`}>{risk.classification}</p>
        </div>

        <div className="bg-card1 p-6 rounded-2xl border border-card2 flex flex-col justify-between">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Risk Components</h2>
          <div className="space-y-4 flex-1">
            {Object.entries(risk.components).map(([key, val]: any) => (
              <div key={key}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300 capitalize">{key.replace('_', ' ')} Risk</span>
                  <span className="font-bold text-slate-100">{val.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-bg3 h-2 rounded-full overflow-hidden">
                  <div className={`h-full ${val > 75 ? 'bg-red-500' : val > 50 ? 'bg-orange-500' : val > 25 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{width: `${val}%`}}></div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-bg2 rounded-lg border border-card2">
            <h3 className="text-xs text-slate-500 font-bold uppercase mb-2">CARF FORMULATION</h3>
            <code className="text-cyan-400 font-mono text-sm block text-center">
              R(t) = αR_v(t) + βR_w(t) + γR_tr(t) + δR_a(t) + εR_n(t)
            </code>
            <p className="text-[10px] text-slate-500 mt-2 text-center">Conceptual risk-fusion equation used by prototype.</p>
          </div>
        </div>
      </div>

      <div className="bg-card1 p-6 rounded-2xl border border-card2">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Risk Context (Live Variables)</h2>
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div className="p-3 bg-bg2 rounded"><span className="text-slate-500 block">Speed:</span> <span className="text-slate-200">{state.vehicle.speed.toFixed(1)} km/h</span></div>
          <div className="p-3 bg-bg2 rounded"><span className="text-slate-500 block">Load:</span> <span className="text-slate-200">{state.vehicle.load.toFixed(1)}%</span></div>
          <div className="p-3 bg-bg2 rounded"><span className="text-slate-500 block">Weather:</span> <span className="text-slate-200">{state.vehicle.rainfall}</span></div>
          <div className="p-3 bg-bg2 rounded"><span className="text-slate-500 block">Visibility:</span> <span className="text-slate-200">{state.vehicle.visibility}</span></div>
          <div className="p-3 bg-bg2 rounded"><span className="text-slate-500 block">Traffic:</span> <span className="text-slate-200">{state.vehicle.traffic_density}</span></div>
          <div className="p-3 bg-bg2 rounded"><span className="text-slate-500 block">Near-Misses:</span> <span className="text-slate-200">{state.vehicle.near_miss_count}</span></div>
        </div>
      </div>
    </div>
  );
}
