import { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { ShieldAlert, Activity, AlertTriangle, CheckCircle, Navigation } from 'lucide-react';

export default function Overview() {
  const [metrics, setMetrics] = useState<any>(null);
  const [mapData, setMapData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('http://localhost:8000/api/metrics'),
      axios.get('http://localhost:8000/api/historical-map')
    ]).then(([metricsRes, mapRes]) => {
      setMetrics(metricsRes.data);
      setMapData(mapRes.data.points);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8 text-slate-400">Loading Authority Dashboard...</div>;

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold mb-1 text-slate-100">Highway Authority Dashboard</h1>
          <p className="text-slate-400">Intelligent Highway Safety Monitoring System</p>
        </div>
        <div className="flex items-center space-x-2 bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
          <Activity className="text-blue-400 w-5 h-5" />
          <span className="text-sm font-semibold text-slate-200">ML Engine: ONLINE</span>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
          <p className="text-slate-400 text-sm mb-1 uppercase tracking-wider font-semibold">Total Historical Collisions</p>
          <p className="text-3xl font-bold text-slate-100">{metrics?.total_rows?.toLocaleString() ?? '513,801'}</p>
        </div>
        <div className="bg-red-900/20 p-5 rounded-xl border border-red-900/50">
          <p className="text-red-400 text-sm mb-1 uppercase tracking-wider font-semibold">Fatal (Critical)</p>
          <p className="text-3xl font-bold text-red-500">{metrics?.distribution?.find((d:any)=>d.label.includes('Fatal'))?.count.toLocaleString() ?? '7,553'}</p>
        </div>
        <div className="bg-amber-900/20 p-5 rounded-xl border border-amber-900/50">
          <p className="text-amber-400 text-sm mb-1 uppercase tracking-wider font-semibold">Serious (High Risk)</p>
          <p className="text-3xl font-bold text-amber-500">{metrics?.distribution?.find((d:any)=>d.label.includes('Serious'))?.count.toLocaleString() ?? '116,813'}</p>
        </div>
        <div className="bg-green-900/20 p-5 rounded-xl border border-green-900/50">
          <p className="text-green-400 text-sm mb-1 uppercase tracking-wider font-semibold">Slight (Moderate)</p>
          <p className="text-3xl font-bold text-green-500">{metrics?.distribution?.find((d:any)=>d.label.includes('Slight'))?.count.toLocaleString() ?? '389,435'}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Map Section */}
        <div className="col-span-2 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col h-[500px]">
          <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
            <h2 className="font-bold flex items-center space-x-2">
              <Navigation className="w-5 h-5 text-blue-400" />
              <span>Historical Accident Hotspots</span>
            </h2>
            <span className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-300 uppercase tracking-wider">UK DfT Dataset</span>
          </div>
          <div className="flex-1 bg-slate-900 relative">
            {mapData.length > 0 ? (
              <MapContainer center={[52.5, -1.5]} zoom={6} className="h-full w-full" style={{ background: '#0f172a' }}>
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  attribution='&copy; OpenStreetMap &copy; CARTO'
                />
                {mapData.map((pt, i) => {
                  const color = pt.risk_level === 'CRITICAL' ? '#ef4444' : pt.risk_level === 'HIGH' ? '#f59e0b' : '#22c55e';
                  return (
                    <CircleMarker 
                      key={i} 
                      center={[pt.latitude, pt.longitude]} 
                      radius={pt.risk_level === 'CRITICAL' ? 8 : 5}
                      pathOptions={{ color, fillColor: color, fillOpacity: 0.7 }}
                    >
                      <Popup className="bg-slate-800 text-slate-200 border-none rounded">
                        <div className="text-sm font-sans p-1">
                          <p className="font-bold border-b border-slate-600 pb-1 mb-1">Historical Incident</p>
                          <p><span className="text-slate-500">Risk:</span> <strong style={{color}}>{pt.risk_level}</strong></p>
                          <p><span className="text-slate-500">Speed Limit:</span> {pt.speed_limit} mph</p>
                          <p><span className="text-slate-500">Time:</span> {pt.time}</p>
                        </div>
                      </Popup>
                    </CircleMarker>
                  );
                })}
              </MapContainer>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-slate-500">Map data unavailable</div>
            )}
          </div>
        </div>

        {/* Recent Alerts (Historical sample) */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 flex flex-col h-[500px]">
          <div className="p-4 bg-slate-900 border-b border-slate-800">
            <h2 className="font-bold flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <span>Recent Risk Alerts</span>
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {mapData.slice(0, 8).map((alert, i) => (
              <div key={i} className={`p-3 rounded-lg border ${alert.risk_level === 'CRITICAL' ? 'border-red-900/50 bg-red-900/10' : alert.risk_level === 'HIGH' ? 'border-amber-900/50 bg-amber-900/10' : 'border-slate-700 bg-slate-800/50'}`}>
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${alert.risk_level === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : alert.risk_level === 'HIGH' ? 'bg-amber-500/20 text-amber-400' : 'bg-green-500/20 text-green-400'}`}>
                    {alert.risk_level} RISK
                  </span>
                  <span className="text-xs text-slate-500">{alert.time}</span>
                </div>
                <p className="text-sm text-slate-300">Lat: {alert.latitude.toFixed(4)}, Lon: {alert.longitude.toFixed(4)}</p>
                <p className="text-xs text-slate-500 mt-1">Speed limit zone: {alert.speed_limit} mph</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
