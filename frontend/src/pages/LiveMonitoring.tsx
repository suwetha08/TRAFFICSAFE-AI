import { useState, useEffect } from 'react';
import axios from 'axios';
import { Car, Gauge, Activity, Compass, Thermometer, Cloud, AlertTriangle, BatteryCharging, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function LiveMonitoring() {
  const [state, setState] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const fetch = () => axios.get('http://localhost:8000/api/state').then(res => {
      setState(res.data);
      setHistory(h => {
        const next = [...h, { time: new Date().toLocaleTimeString(), speed: res.data.vehicle.speed }];
        return next.slice(-20);
      });
    }).catch(()=>{});
    fetch();
    const interval = setInterval(fetch, 1000);
    return () => clearInterval(interval);
  }, []);

  const setScenario = (scenario: string) => {
    axios.post('http://localhost:8000/api/simulation/scenario', { scenario });
    if (!state?.simulation_active) {
      axios.post('http://localhost:8000/api/simulation/start');
    }
  };

  const toggleSimulation = () => {
    if (state?.simulation_active) {
      axios.post('http://localhost:8000/api/simulation/stop');
    } else {
      axios.post('http://localhost:8000/api/simulation/start');
    }
  };

  if (!state) return <div className="p-8 text-slate-500">Connecting to telemetry...</div>;
  const v = state.vehicle;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end border-b border-card2 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 flex items-center space-x-3"><Car className="w-8 h-8 text-cyan-400" /><span>Live Vehicle Monitoring</span></h1>
        </div>
        <div className="flex space-x-4">
          <div className="bg-card1 px-4 py-2 rounded-lg border border-card2">
            <p className="text-xs text-slate-400">Vehicle Selector</p>
            <p className="font-bold text-cyan-400">HV-1024</p>
          </div>
          <button onClick={toggleSimulation} className={`px-4 py-2 rounded-lg border flex items-center space-x-2 transition ${state.simulation_active ? 'bg-green-600/20 border-green-500/50 hover:bg-green-600/40' : 'bg-card1 border-card2 hover:bg-card2'}`}>
            <div className={`w-3 h-3 rounded-full ${state.simulation_active ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="font-bold text-slate-200">{state.simulation_active ? 'LIVE (Click to Stop)' : 'OFFLINE (Click to Start)'}</span>
          </button>
        </div>
      </div>

      <div className="bg-card1 p-4 rounded-xl border border-card2 flex space-x-4">
        <span className="text-sm text-slate-400 flex items-center">Simulate Scenario:</span>
        <button onClick={()=>setScenario('NORMAL')} className={`px-4 py-1.5 rounded text-sm font-bold ${state.scenario === 'NORMAL' ? 'bg-green-600 text-white' : 'bg-card2 text-slate-400 hover:bg-slate-700'}`}>NORMAL</button>
        <button onClick={()=>setScenario('WARNING')} className={`px-4 py-1.5 rounded text-sm font-bold ${state.scenario === 'WARNING' ? 'bg-yellow-600 text-white' : 'bg-card2 text-slate-400 hover:bg-slate-700'}`}>WARNING</button>
        <button onClick={()=>setScenario('CRITICAL')} className={`px-4 py-1.5 rounded text-sm font-bold ${state.scenario === 'CRITICAL' ? 'bg-red-600 text-white' : 'bg-card2 text-slate-400 hover:bg-slate-700'}`}>CRITICAL</button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Speed', val: `${v.speed.toFixed(1)} km/h`, icon: Gauge },
          { label: 'Load', val: `${v.load.toFixed(1)}%`, icon: BatteryCharging },
          { label: 'Acceleration', val: `${v.acceleration} m/s²`, icon: Activity },
          { label: 'Brake Intensity', val: v.brake_intensity, icon: AlertTriangle },
          { label: 'Tilt', val: `${v.tilt}°`, icon: TrendingUp },
          { label: 'Temperature', val: `${v.temperature}°C`, icon: Thermometer },
          { label: 'Visibility', val: v.visibility, icon: Cloud },
          { label: 'GPS', val: `${v.latitude.toFixed(4)} N, ${v.longitude.toFixed(4)} E`, icon: Compass },
        ].map((m, i) => (
          <div key={i} className="bg-card1 p-4 rounded-xl border border-card2 flex items-center space-x-4">
            <div className="p-3 bg-card2 rounded-lg text-cyan-400"><m.icon className="w-6 h-6" /></div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider">{m.label}</p>
              <p className="text-xl font-bold text-slate-200">{m.val}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-card1 p-5 rounded-xl border border-card2 h-[300px]">
          <h2 className="text-sm font-bold text-slate-400 uppercase mb-4">Real-Time Speed Chart</h2>
          <ResponsiveContainer width="100%" height="80%">
            <LineChart data={history}>
              <XAxis dataKey="time" stroke="#475569" fontSize={10} />
              <YAxis domain={['dataMin - 5', 'dataMax + 5']} stroke="#475569" fontSize={10} />
              <Tooltip contentStyle={{backgroundColor: '#111F33', border: 'none', color: '#fff'}} />
              <Line type="monotone" dataKey="speed" stroke="#22D3EE" strokeWidth={3} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-card1 p-5 rounded-xl border border-card2">
          <h2 className="text-sm font-bold text-slate-400 uppercase mb-4">Vehicle Health</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center"><span className="text-slate-300">Engine</span> <span className="text-green-400 font-bold">{v.engine}</span></div>
            <div className="flex justify-between items-center"><span className="text-slate-300">Brake System</span> <span className={v.brake_system === 'Normal' ? 'text-green-400 font-bold' : 'text-yellow-400 font-bold'}>{v.brake_system}</span></div>
            <div className="flex justify-between items-center"><span className="text-slate-300">Load Condition</span> <span className={v.load > 90 ? 'text-red-400 font-bold' : 'text-green-400 font-bold'}>{v.load > 90 ? 'High' : 'Normal'}</span></div>
            <div className="flex justify-between items-center"><span className="text-slate-300">Stability</span> <span className="text-yellow-400 font-bold">{v.stability}</span></div>
            <div className="flex justify-between items-center"><span className="text-slate-300">Sensor Connectivity</span> <span className="text-green-400 font-bold">Online</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
