import { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldAlert, History, MapPin, Clock } from 'lucide-react';

export default function Alerts() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We reuse the historical-map endpoint to simulate alerts stream
    axios.get('http://localhost:8000/api/historical-map')
      .then(res => {
        // Sort to simulate "recent" first
        const sorted = res.data.points.slice(0, 50).reverse();
        setAlerts(sorted);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8 text-slate-400">Loading historical alerts...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1 text-slate-100 flex items-center space-x-3">
            <ShieldAlert className="w-8 h-8 text-blue-500" />
            <span>Recent Alerts</span>
          </h1>
          <p className="text-slate-400">Monitoring logs and historical high-risk incidents.</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-lg text-sm text-slate-300 flex items-center space-x-2">
          <History className="w-4 h-4 text-slate-500" />
          <span>Showing historical dataset events</span>
        </div>
      </div>

      <div className="space-y-4">
        {alerts.map((alert, i) => (
          <div key={i} className="bg-slate-800 rounded-xl border border-slate-700 p-5 flex items-center justify-between hover:bg-slate-700/50 transition">
            <div className="flex items-center space-x-6">
              <div className={`w-16 h-16 rounded-full flex flex-col items-center justify-center border-4 ${
                alert.risk_level === 'CRITICAL' ? 'border-red-900/50 bg-red-500/20 text-red-500' :
                alert.risk_level === 'HIGH' ? 'border-amber-900/50 bg-amber-500/20 text-amber-500' :
                'border-green-900/50 bg-green-500/20 text-green-500'
              }`}>
                <span className="text-[10px] font-bold uppercase">{alert.risk_level}</span>
              </div>
              
              <div>
                <div className="flex items-center space-x-3 mb-1">
                  <h3 className="font-bold text-slate-200">Historical Event</h3>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    alert.collision_severity === 1 ? 'bg-red-500 text-white' : 
                    alert.collision_severity === 2 ? 'bg-amber-500 text-white' : 
                    'bg-green-500 text-white'
                  }`}>
                    {alert.collision_severity === 1 ? 'FATAL' : alert.collision_severity === 2 ? 'SERIOUS' : 'SLIGHT'}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-slate-400">
                  <span className="flex items-center space-x-1"><MapPin className="w-3.5 h-3.5" /> <span>{alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}</span></span>
                  <span className="flex items-center space-x-1"><Clock className="w-3.5 h-3.5" /> <span>Time: {alert.time}</span></span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-slate-400">Speed Limit</p>
              <p className="font-bold text-lg text-slate-200">{alert.speed_limit} mph</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
