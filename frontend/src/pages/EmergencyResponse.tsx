import { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldAlert, MapPin, Truck, PhoneCall, Radio } from 'lucide-react';

export default function EmergencyResponse() {
  const [incidents, setIncidents] = useState<any[]>([]);

  useEffect(() => {
    const fetch = () => axios.get('http://localhost:8000/api/lists').then(res => setIncidents(res.data.incidents)).catch(()=>{});
    fetch();
    const interval = setInterval(fetch, 2000);
    return () => clearInterval(interval);
  }, []);

  const active = incidents[0];

  if (!active) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500">
        <ShieldAlert className="w-16 h-16 mb-4 opacity-20" />
        <h2 className="text-xl font-bold">No Active Emergencies</h2>
        <p>Control room is standing by.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="bg-red-500 text-white p-4 rounded-xl flex items-center justify-between shadow-lg shadow-red-500/20 animate-pulse">
        <div className="flex items-center space-x-3">
          <ShieldAlert className="w-8 h-8" />
          <span className="text-2xl font-black tracking-widest">ACTIVE EMERGENCY</span>
        </div>
        <div className="text-right">
          <span className="font-bold">{active.id}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-card1 border border-red-500/30 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-card2 grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Vehicle</p>
              <p className="text-xl font-bold text-slate-200">{active.vehicle}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Severity</p>
              <p className="text-xl font-bold text-red-500">{active.severity}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Location</p>
              <p className="text-lg font-bold text-slate-200 flex items-center space-x-1"><MapPin className="w-4 h-4"/><span>{active.location}</span></p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Coordinates</p>
              <p className="text-lg font-mono text-cyan-400">{active.coordinates[0].toFixed(4)}° N, {active.coordinates[1].toFixed(4)}° E</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Detected</p>
              <p className="text-lg text-slate-200">{active.timestamp}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Response Status</p>
              <p className="text-lg font-bold text-yellow-500 animate-pulse">DISPATCHING</p>
            </div>
          </div>
          
          <div className="p-6 bg-bg2">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Response Timeline</h3>
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-700 before:to-transparent">
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-card1 bg-red-500 text-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow"><ShieldAlert className="w-4 h-4" /></div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-card1 p-3 rounded border border-red-500/30">
                  <div className="flex items-center justify-between mb-1"><div className="font-bold text-slate-200 text-sm">Incident detected</div><time className="font-mono text-xs text-cyan-400">{active.timestamp}</time></div>
                  <div className="text-slate-400 text-xs">Risk threshold exceeded critical limit.</div>
                </div>
              </div>
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-card1 bg-orange-500 text-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow"><Radio className="w-4 h-4" /></div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-card1 p-3 rounded border border-card2">
                  <div className="flex items-center justify-between mb-1"><div className="font-bold text-slate-200 text-sm">Emergency alert generated</div></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <button className="w-full bg-red-600 hover:bg-red-500 text-white py-4 rounded-xl shadow-lg flex items-center justify-center space-x-2 font-bold transition">
            <Truck className="w-5 h-5" /> <span>Dispatch Emergency Unit</span>
          </button>
          <button className="w-full bg-card2 hover:bg-slate-700 border border-slate-600 text-white py-4 rounded-xl flex items-center justify-center space-x-2 font-bold transition">
            <PhoneCall className="w-5 h-5" /> <span>Notify Control Room</span>
          </button>
          <button className="w-full bg-card2 hover:bg-slate-700 border border-slate-600 text-white py-4 rounded-xl flex items-center justify-center space-x-2 font-bold transition">
            <Radio className="w-5 h-5" /> <span>Notify Driver</span>
          </button>
          <button className="w-full bg-transparent hover:bg-card2 border border-slate-700 text-slate-400 py-4 rounded-xl font-bold transition mt-8">
            Mark Resolved
          </button>

          <div className="bg-card1 p-5 rounded-xl border border-card2 mt-8">
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Average Response</p>
            <p className="text-2xl font-bold text-slate-200">8.6 min</p>
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1 mt-4">Alert Generation</p>
            <p className="text-2xl font-bold text-cyan-400">2.8 s</p>
          </div>
        </div>
      </div>
    </div>
  );
}
