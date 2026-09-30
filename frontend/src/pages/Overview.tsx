import { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, ShieldAlert, Navigation, Car, AlertTriangle, AlertOctagon, CheckCircle } from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function Overview() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetch = () => axios.get('http://localhost:8000/api/dashboard').then(res => setData(res.data)).catch(()=>{});
    fetch();
    const interval = setInterval(fetch, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleStartSim = () => axios.post('http://localhost:8000/api/simulation/start');
  const handleTest = () => axios.post('http://localhost:8000/api/simulation/near-miss');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">HIGHWAY GUARDIAN</h1>
          <p className="text-slate-400 mt-1">Real-Time Heavy Vehicle Safety Intelligence</p>
          <p className="text-cyan-500/80 text-sm mt-1">Context-aware multimodal monitoring and predictive risk assessment</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={handleStartSim} className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded shadow transition">Start Simulation</button>
          <button onClick={handleTest} className="bg-red-600/20 text-red-400 hover:bg-red-600/40 border border-red-500/30 px-4 py-2 rounded transition">Emergency Test</button>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-4">
        {[
          { label: 'Active Vehicles', value: data?.active_vehicles || 0, icon: Car, color: 'text-cyan-400' },
          { label: 'High-Risk Vehicles', value: data?.high_risk_vehicles || 0, icon: ShieldAlert, color: 'text-amber-400' },
          { label: 'Near-Miss Events', value: data?.near_misses || 0, icon: AlertTriangle, color: 'text-orange-400' },
          { label: 'Active Incidents', value: data?.active_incidents || 0, icon: AlertOctagon, color: 'text-red-400' },
          { label: 'Average Risk Score', value: `${data?.avg_risk || 0}%`, icon: Activity, color: 'text-blue-400' },
          { label: 'Alert Delivery', value: `${data?.alert_delivery || 0}%`, icon: CheckCircle, color: 'text-green-400' },
        ].map((kpi, i) => (
          <div key={i} className="bg-card1 border border-card2 rounded-xl p-4 relative overflow-hidden">
            <kpi.icon className={`absolute -right-2 -bottom-2 w-16 h-16 opacity-5 ${kpi.color}`} />
            <div className="flex justify-between items-start">
              <kpi.icon className={`w-5 h-5 ${kpi.color} mb-2`} />
            </div>
            <p className="text-2xl font-bold text-slate-100">{kpi.value}</p>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-card1 border border-card2 rounded-xl h-[500px] flex flex-col overflow-hidden relative">
        <div className="p-4 bg-bg2 border-b border-card2 flex justify-between">
          <h2 className="font-bold flex items-center space-x-2 text-slate-200"><Navigation className="w-4 h-4 text-cyan-400" /><span>Live Highway Risk Map</span></h2>
          <div className="flex space-x-3 text-xs">
            <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-green-500"></span><span>Low</span></span>
            <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-yellow-500"></span><span>Moderate</span></span>
            <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-orange-500"></span><span>High</span></span>
            <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-red-500"></span><span>Critical</span></span>
          </div>
        </div>
        <div className="flex-1">
          <MapContainer center={[11.0168, 76.9558]} zoom={12} className="h-full w-full" style={{ background: '#07111F' }}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
            {/* The live vehicle marker */}
            <CircleMarker center={[11.0168, 76.9558]} radius={8} pathOptions={{ color: '#EF4444', fillColor: '#EF4444', fillOpacity: 0.8 }}>
               <Popup className="bg-card1 text-slate-200 border-none rounded shadow-2xl">
                 <div className="text-sm">
                   <p className="font-bold border-b border-card2 pb-1 mb-2 text-cyan-400">Vehicle ID: HV-1024</p>
                   <p><span className="text-slate-400">Risk:</span> <strong className="text-red-400">81.4%</strong></p>
                   <p><span className="text-slate-400">Status:</span> HIGH RISK</p>
                   <p><span className="text-slate-400">Speed:</span> 87 km/h</p>
                   <button className="mt-2 w-full bg-cyan-600/20 text-cyan-400 py-1 rounded border border-cyan-500/30">View Vehicle</button>
                 </div>
               </Popup>
            </CircleMarker>
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
