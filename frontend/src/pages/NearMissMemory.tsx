import { useState, useEffect } from 'react';
import axios from 'axios';
import { History, MapPin, AlertTriangle } from 'lucide-react';

export default function NearMissMemory() {
  const [misses, setMisses] = useState<any[]>([]);

  useEffect(() => {
    const fetch = () => axios.get('http://localhost:8000/api/lists').then(res => setMisses(res.data.near_misses)).catch(()=>{});
    fetch();
    const interval = setInterval(fetch, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-100 flex items-center space-x-3">
          <History className="w-8 h-8 text-cyan-400" />
          <span>Near-Miss Risk Memory</span>
        </h1>
        <p className="text-slate-400 mt-1">Learning from hazardous events before they become collisions</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-card1 border border-card2 p-4 rounded-xl">
          <p className="text-xs text-slate-400 uppercase">Total Near Misses</p>
          <p className="text-3xl font-bold text-slate-100 mt-1">{misses.length}</p>
        </div>
        <div className="bg-card1 border border-card2 p-4 rounded-xl">
          <p className="text-xs text-slate-400 uppercase">Today</p>
          <p className="text-3xl font-bold text-cyan-400 mt-1">{misses.length}</p>
        </div>
        <div className="bg-card1 border border-card2 p-4 rounded-xl">
          <p className="text-xs text-slate-400 uppercase">High Severity</p>
          <p className="text-3xl font-bold text-orange-400 mt-1">{misses.filter(m=>m.severity==='High').length}</p>
        </div>
        <div className="bg-card1 border border-card2 p-4 rounded-xl">
          <p className="text-xs text-slate-400 uppercase">Hotspots</p>
          <p className="text-3xl font-bold text-red-400 mt-1">1</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-card1 border border-card2 rounded-xl overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-bg2 text-slate-400 uppercase text-xs border-b border-card2">
              <tr>
                <th className="px-4 py-3">Event ID</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Context</th>
              </tr>
            </thead>
            <tbody>
              {misses.map((m, i) => (
                <tr key={i} className="border-b border-card2 hover:bg-bg2 transition">
                  <td className="px-4 py-3 font-mono text-cyan-400">{m.id}</td>
                  <td className="px-4 py-3 text-slate-300">{m.timestamp}</td>
                  <td className="px-4 py-3 text-slate-300">{m.location}</td>
                  <td className="px-4 py-3 text-slate-300">{m.type}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded text-xs font-bold ${m.severity==='High'?'bg-orange-500/20 text-orange-400':'bg-yellow-500/20 text-yellow-400'}`}>{m.severity}</span></td>
                  <td className="px-4 py-3 text-slate-400">{m.speed}, {m.weather}</td>
                </tr>
              ))}
              {misses.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">No near-miss events recorded yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-card1 border border-card2 rounded-xl p-5 flex flex-col">
          <h2 className="text-sm font-bold text-slate-400 uppercase mb-4 flex items-center space-x-2"><AlertTriangle className="w-4 h-4 text-orange-400" /><span>Risk Memory Insight</span></h2>
          <div className="flex-1 space-y-4">
            <div className="bg-bg2 p-4 rounded-lg border border-card2">
              <p className="text-sm text-slate-300">Repeated near-miss activity detected in <strong>Highway Segment 42</strong>.</p>
            </div>
            <div className="bg-bg2 p-4 rounded-lg border border-card2">
              <p className="text-sm text-slate-300"><strong>{misses.length} near-miss events</strong> recorded within the selected time window.</p>
            </div>
            <div className="bg-orange-900/20 p-4 rounded-lg border border-orange-500/30">
              <p className="text-sm text-orange-300">Current conditions indicate elevated recurrence risk based on historical memory.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
