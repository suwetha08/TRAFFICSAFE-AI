import { useState } from 'react';
import axios from 'axios';
import { Car, MapPin, AlertCircle, ShieldCheck, ThermometerSnowflake, Sun, CloudRain } from 'lucide-react';

export default function DriverView() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<any>(null);

  // Mock a "Live sensor update" which actually just runs our Random Forest model
  const simulateLiveData = async (scenario: 'rain_night' | 'clear_day' | 'rural_fast') => {
    setLoading(true);
    let payload = {};
    if (scenario === 'rain_night') payload = { road_type: 6, speed_limit: 70, light_conditions: 6, weather_conditions: 2, road_surface_conditions: 2, urban_or_rural_area: 1, day_of_week: 6, time: "23:00" };
    if (scenario === 'clear_day') payload = { road_type: 3, speed_limit: 30, light_conditions: 1, weather_conditions: 1, road_surface_conditions: 1, urban_or_rural_area: 1, day_of_week: 2, time: "14:00" };
    if (scenario === 'rural_fast') payload = { road_type: 6, speed_limit: 60, light_conditions: 4, weather_conditions: 4, road_surface_conditions: 1, urban_or_rural_area: 2, day_of_week: 7, time: "20:00" };

    try {
      const res = await axios.post('http://localhost:8000/api/predict', payload);
      setStatus({ ...payload, ...res.data, scenario });
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1 text-slate-100 flex items-center space-x-3">
          <Car className="w-8 h-8 text-amber-500" />
          <span>Driver Safety View</span>
        </h1>
        <p className="text-slate-400">In-cabin risk intelligence powered by Random Forest severity prediction.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <button onClick={() => simulateLiveData('clear_day')} className="p-4 bg-slate-800 rounded-xl border border-slate-700 hover:border-blue-500 transition text-left group">
          <div className="flex items-center space-x-2 mb-2"><Sun className="w-5 h-5 text-yellow-400" /><span className="font-bold text-slate-200">Urban Day</span></div>
          <p className="text-xs text-slate-400">Simulate: 30mph, daylight, clear weather, urban area.</p>
        </button>
        <button onClick={() => simulateLiveData('rain_night')} className="p-4 bg-slate-800 rounded-xl border border-slate-700 hover:border-blue-500 transition text-left group">
          <div className="flex items-center space-x-2 mb-2"><CloudRain className="w-5 h-5 text-blue-400" /><span className="font-bold text-slate-200">Motorway Rain</span></div>
          <p className="text-xs text-slate-400">Simulate: 70mph, night (unlit), raining, wet surface.</p>
        </button>
        <button onClick={() => simulateLiveData('rural_fast')} className="p-4 bg-slate-800 rounded-xl border border-slate-700 hover:border-blue-500 transition text-left group">
          <div className="flex items-center space-x-2 mb-2"><ThermometerSnowflake className="w-5 h-5 text-cyan-400" /><span className="font-bold text-slate-200">Rural Evening</span></div>
          <p className="text-xs text-slate-400">Simulate: 60mph, evening, fog, rural area.</p>
        </button>
      </div>

      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
        </div>
      )}

      {!loading && status && (
        <div className="flex-1 flex justify-center items-start">
          <div className="w-full max-w-md bg-slate-900 rounded-3xl border border-slate-700 shadow-2xl overflow-hidden relative">
            {/* Status Header */}
            <div className={`p-8 text-center ${status.risk_level === 'CRITICAL' ? 'bg-red-600' : status.risk_level === 'HIGH' ? 'bg-amber-600' : 'bg-green-600'}`}>
              <p className="text-white/80 text-sm font-bold tracking-widest uppercase mb-1">Current Risk Level</p>
              <h2 className="text-4xl font-black text-white tracking-tight">{status.risk_level}</h2>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Sensor Data */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                  <p className="text-xs text-slate-500 uppercase">GPS Location</p>
                  <p className="font-mono text-sm text-slate-300 mt-1 flex items-center space-x-1"><MapPin className="w-3 h-3 text-blue-400"/><span>Demo Route A</span></p>
                </div>
                <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                  <p className="text-xs text-slate-500 uppercase">Speed Limit Zone</p>
                  <p className="font-bold text-lg text-slate-200 mt-1">{status.speed_limit} <span className="text-sm font-normal text-slate-400">mph</span></p>
                </div>
              </div>

              {/* Model Output */}
              <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-bold text-slate-300">Predicted Severity</p>
                  <span className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-400">ML Engine</span>
                </div>
                <p className={`text-xl font-bold ${status.risk_level === 'CRITICAL' ? 'text-red-400' : status.risk_level === 'HIGH' ? 'text-amber-400' : 'text-green-400'}`}>
                  {status.predicted_label.toUpperCase()}
                </p>
                <div className="mt-3 text-xs text-slate-500 space-y-1">
                  <p>Probabilities:</p>
                  <div className="flex space-x-3">
                    <span>Fatal: {(status.probabilities.Fatal*100).toFixed(1)}%</span>
                    <span>Serious: {(status.probabilities.Serious*100).toFixed(1)}%</span>
                    <span>Slight: {(status.probabilities.Slight*100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              {/* Recommendation */}
              <div className="bg-blue-900/20 p-4 rounded-xl border border-blue-900/50 flex items-start space-x-3">
                {status.risk_level === 'MODERATE' ? <ShieldCheck className="w-6 h-6 text-blue-400 flex-shrink-0" /> : <AlertCircle className="w-6 h-6 text-amber-400 flex-shrink-0" />}
                <div>
                  <p className="text-sm font-bold text-slate-200">Safety Recommendation</p>
                  <p className="text-sm text-slate-400 mt-1">
                    {status.risk_level === 'CRITICAL' && "Extreme caution required. Reduce speed significantly. Road layout and environmental conditions present historical critical severity risk."}
                    {status.risk_level === 'HIGH' && "Exercise caution. Ensure appropriate stopping distance. Current conditions match patterns of high-severity incidents."}
                    {status.risk_level === 'MODERATE' && "Conditions are standard. Maintain normal safe driving practices and observe speed limits."}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Disclaimer */}
            <div className="bg-slate-950 p-3 text-center">
              <p className="text-[10px] text-slate-600">Advisory only. Not a medical or emergency guarantee.</p>
            </div>
          </div>
        </div>
      )}

      {!loading && !status && (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 opacity-50">
          <Car className="w-16 h-16 mb-4" />
          <p>Select a scenario above to simulate the driver safety view.</p>
        </div>
      )}
    </div>
  );
}
