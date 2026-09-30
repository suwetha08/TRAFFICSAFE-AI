import { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, ShieldAlert, Navigation, Car, AlertTriangle, AlertOctagon, CheckCircle } from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function Overview() {
  const [data, setData] = useState<any>(null);
  const [state, setState] = useState<any>(null);

  useEffect(() => {
    const fetch = () => {
      axios.get('http://localhost:8000/api/dashboard').then(res => setData(res.data)).catch(()=>{});
      axios.get('http://localhost:8000/api/state').then(res => setState(res.data)).catch(()=>{});
    };
    fetch();
    const interval = setInterval(fetch, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleStartSim = () => {
    if (!state?.simulation_active) {
      axios.post('http://localhost:8000/api/simulation/start');
    } else {
      axios.post('http://localhost:8000/api/simulation/stop');
    }
  };
  
  const handleTest = () => {
    axios.post('http://localhost:8000/api/simulation/near-miss');
  };

  const v = state?.vehicle || { latitude: 11.0168, longitude: 76.9558, speed: 0 };
  const r = state?.risk || { total: 0, classification: 'UNKNOWN' };
  const isActive = state?.simulation_active;

  return (
    <div className="flex flex-col h-full space-y-6 pb-2">
      <div className="flex justify-between items-end flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">HIGHWAY GUARDIAN</h1>
          <p className="text-slate-400 mt-1">Real-Time Heavy Vehicle Safety Intelligence</p>
          <p className="text-cyan-500/80 text-sm mt-1">Context-aware multimodal monitoring and predictive risk assessment</p>
        </div>
        <div className="flex space-x-3 flex-shrink-0">
          <button onClick={handleStartSim} className={`${isActive ? 'bg-green-600 hover:bg-green-500' : 'bg-cyan-600 hover:bg-cyan-500'} text-white px-4 py-2 rounded shadow transition flex items-center space-x-2`}>
            {isActive && <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>}
            <span>{isActive ? 'Simulation Running' : 'Start Simulation'}</span>
          </button>
          <button onClick={handleTest} className="bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white border border-red-500/30 px-4 py-2 rounded transition font-bold">
            Emergency Test (Trigger Near-Miss)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-4 flex-shrink-0">
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

      <div className="bg-card1 border border-card2 rounded-xl flex-1 flex flex-col overflow-hidden relative min-h-[400px]">
        <div className="p-4 bg-bg2 border-b border-card2 flex justify-between flex-shrink-0">
          <h2 className="font-bold flex items-center space-x-2 text-slate-200"><Navigation className="w-4 h-4 text-cyan-400" /><span>Live Highway Risk Map</span></h2>
          <div className="flex space-x-3 text-xs items-center">
            {isActive && <span className="text-green-400 animate-pulse mr-4 font-mono text-[10px]">VEHICLE TRACKING ACTIVE</span>}
            <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-green-500"></span><span>Low</span></span>
            <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-yellow-500"></span><span>Moderate</span></span>
            <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-orange-500"></span><span>High</span></span>
            <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-red-500"></span><span>Critical</span></span>
          </div>
        </div>
        <div className="flex-1 relative">
          <MapContainer center={[11.0168, 76.9558]} zoom={13} className="h-full w-full" style={{ background: '#07111F' }}>
            <TileLayer 
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
              className="map-tiles"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {/* The live vehicle marker */}
            <CircleMarker 
              center={[v.latitude, v.longitude]} 
              radius={r.classification === 'CRITICAL' ? 12 : 8} 
              pathOptions={{ 
                color: r.classification === 'CRITICAL' ? '#EF4444' : r.classification === 'HIGH' ? '#F97316' : r.classification === 'MODERATE' ? '#F59E0B' : '#22C55E', 
                fillColor: r.classification === 'CRITICAL' ? '#EF4444' : r.classification === 'HIGH' ? '#F97316' : r.classification === 'MODERATE' ? '#F59E0B' : '#22C55E', 
                fillOpacity: 0.8 
              }}
            >
               <Popup className="bg-card1 text-slate-200 border-none rounded shadow-2xl">
                 <div className="text-sm">
                   <p className="font-bold border-b border-card2 pb-1 mb-2 text-cyan-400">Vehicle ID: {v.id || 'HV-1024'}</p>
                   <p><span className="text-slate-400">Risk:</span> <strong className="text-red-400">{r.total.toFixed(1)}%</strong></p>
                   <p><span className="text-slate-400">Status:</span> {r.classification}</p>
                   <p><span className="text-slate-400">Speed:</span> {v.speed.toFixed(1)} km/h</p>
                   <p><span className="text-slate-400">Coords:</span> {v.latitude.toFixed(4)}, {v.longitude.toFixed(4)}</p>
                 </div>
               </Popup>
            </CircleMarker>
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
