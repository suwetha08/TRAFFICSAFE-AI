import { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertTriangle, MapPin, Clock } from 'lucide-react';

export default function IncidentManagement() {
  const [incidents, setIncidents] = useState<any[]>([]);

  useEffect(() => {
    const fetch = () => axios.get('http://localhost:8000/api/lists').then(res => setIncidents(res.data.incidents)).catch(()=>{});
    fetch();
    const interval = setInterval(fetch, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 flex items-center space-x-3">
            <AlertTriangle className="w-8 h-8 text-orange-400" />
            <span>Incident Detection & Classification</span>
          </h1>
        </div>
        <div className="flex space-x-2">
          {['All', 'Critical', 'High', 'Medium', 'Resolved'].map(f => (
            <button key={f} className={`px-4 py-1.5 text-sm font-semibold rounded-full border ${f==='All' ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' : 'bg-bg2 text-slate-400 border-card2 hover:bg-card1'}`}>{f}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {incidents.map((inc, i) => (
          <div key={i} className="bg-card1 border border-red-500/30 p-5 rounded-xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
            <div className="flex justify-between items-start mb-4 pl-2">
              <div>
                <p className="text-xs text-slate-400 font-mono mb-1">{inc.id}</p>
                <h3 className="text-lg font-bold text-slate-200">{inc.type}</h3>
              </div>
              <span className="bg-red-500/20 text-red-500 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">{inc.severity}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm pl-2 mb-6">
              <div><span className="text-slate-500 block text-xs">Vehicle</span><span className="text-slate-200 font-bold">{inc.vehicle}</span></div>
              <div><span className="text-slate-500 block text-xs">Detected</span><span className="text-slate-200 flex items-center space-x-1"><Clock className="w-3 h-3"/><span>{inc.timestamp}</span></span></div>
              <div><span className="text-slate-500 block text-xs">Location</span><span className="text-slate-200 flex items-center space-x-1"><MapPin className="w-3 h-3"/><span>{inc.location}</span></span></div>
              <div><span className="text-slate-500 block text-xs">Confidence</span><span className="text-cyan-400 font-bold">{inc.confidence}%</span></div>
            </div>

            <div className="flex space-x-3 pl-2">
              <button className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2 rounded text-sm font-bold transition">Dispatch</button>
              <button className="flex-1 bg-card2 hover:bg-slate-700 text-slate-200 py-2 rounded text-sm font-bold transition">Acknowledge</button>
              <button className="flex-1 bg-transparent hover:bg-card2 border border-card2 text-slate-400 py-2 rounded text-sm font-bold transition">View Details</button>
            </div>
          </div>
        ))}
        {incidents.length === 0 && (
          <div className="col-span-2 p-12 text-center text-slate-500 bg-card1 border border-card2 rounded-xl">
            No active incidents detected.
          </div>
        )}
      </div>
    </div>
  );
}
