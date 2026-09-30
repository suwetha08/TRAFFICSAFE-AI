import { useState } from 'react';
import axios from 'axios';
import { PlayCircle } from 'lucide-react';

export default function LivePrediction() {
  const [formData, setFormData] = useState({
    road_type: 6,
    speed_limit: 30,
    light_conditions: 1,
    weather_conditions: 1,
    road_surface_conditions: 1,
    urban_or_rural_area: 1,
    day_of_week: 1,
    time: "12:00"
  });
  
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'time' ? value : Number(value)
    }));
  };

  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post('http://localhost:8000/api/predict', formData);
      setResult(res.data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to connect to backend API.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-2">LIVE ACCIDENT SEVERITY PREDICTION</h1>
      <p className="text-slate-400 mb-8">Enter a new accident scenario and generate a real-time severity prediction.</p>
      
      <div className="grid grid-cols-2 gap-8">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h2 className="text-xl font-bold mb-4 border-b border-slate-700 pb-2">Accident Conditions</h2>
          
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Road Type</label>
              <select name="road_type" value={formData.road_type} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-slate-200">
                <option value={1}>Roundabout</option>
                <option value={2}>One way street</option>
                <option value={3}>Dual carriageway</option>
                <option value={6}>Single carriageway</option>
                <option value={7}>Slip road</option>
                <option value={9}>Unknown</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Speed Limit</label>
              <select name="speed_limit" value={formData.speed_limit} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-slate-200">
                <option value={20}>20 mph</option>
                <option value={30}>30 mph</option>
                <option value={40}>40 mph</option>
                <option value={50}>50 mph</option>
                <option value={60}>60 mph</option>
                <option value={70}>70 mph</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Light Conditions</label>
              <select name="light_conditions" value={formData.light_conditions} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-slate-200">
                <option value={1}>Daylight</option>
                <option value={4}>Darkness - lights lit</option>
                <option value={5}>Darkness - lights unlit</option>
                <option value={6}>Darkness - no lighting</option>
                <option value={7}>Darkness - lighting unknown</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Weather Conditions</label>
              <select name="weather_conditions" value={formData.weather_conditions} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-slate-200">
                <option value={1}>Fine no high winds</option>
                <option value={2}>Raining no high winds</option>
                <option value={3}>Snowing no high winds</option>
                <option value={4}>Fine + high winds</option>
                <option value={5}>Raining + high winds</option>
                <option value={6}>Snowing + high winds</option>
                <option value={7}>Fog or mist</option>
                <option value={8}>Other</option>
                <option value={9}>Unknown</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Road Surface Conditions</label>
              <select name="road_surface_conditions" value={formData.road_surface_conditions} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-slate-200">
                <option value={1}>Dry</option>
                <option value={2}>Wet or damp</option>
                <option value={3}>Snow</option>
                <option value={4}>Frost or ice</option>
                <option value={5}>Flood over 3cm. deep</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Environment</label>
              <select name="urban_or_rural_area" value={formData.urban_or_rural_area} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-slate-200">
                <option value={1}>Urban</option>
                <option value={2}>Rural</option>
                <option value={3}>Unallocated</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Day of Week</label>
                <select name="day_of_week" value={formData.day_of_week} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-slate-200">
                  <option value={1}>Sunday</option>
                  <option value={2}>Monday</option>
                  <option value={3}>Tuesday</option>
                  <option value={4}>Wednesday</option>
                  <option value={5}>Thursday</option>
                  <option value={6}>Friday</option>
                  <option value={7}>Saturday</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Time</label>
                <input type="time" name="time" value={formData.time} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-slate-200" />
              </div>
            </div>
          </div>
          
          <button 
            onClick={handlePredict}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold py-3 px-4 rounded flex items-center justify-center space-x-2 transition"
          >
            <PlayCircle />
            <span>{loading ? 'PREDICTING...' : 'PREDICT ACCIDENT SEVERITY'}</span>
          </button>
          
          {error && (
            <div className="mt-4 p-3 bg-red-900/50 border border-red-500 rounded text-red-200">
              {error}
            </div>
          )}
        </div>

        <div>
          {loading && (
            <div className="bg-slate-800 p-8 rounded-xl border border-blue-500 text-center animate-pulse">
              <p className="text-xl font-bold text-blue-400">Analyzing accident scenario...</p>
            </div>
          )}
          
          {result && !loading && (
            <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 shadow-xl">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-sm text-slate-400 font-semibold mb-1">PREDICTED SEVERITY</h2>
                  <div className={`text-4xl font-bold ${result.predicted_class === 1 ? 'text-red-500' : result.predicted_class === 2 ? 'text-amber-500' : 'text-green-500'}`}>
                    {result.predicted_label || 'Unknown'}
                  </div>
                </div>
                <div className="text-right">
                  <h2 className="text-sm text-slate-400 font-semibold mb-1">RISK INTERPRETATION</h2>
                  <div className={`text-2xl font-bold ${result.risk_level === 'CRITICAL' ? 'text-red-500' : result.risk_level === 'HIGH' ? 'text-amber-500' : 'text-green-500'}`}>
                    {result.risk_level || 'UNKNOWN'}
                  </div>
                </div>
              </div>
              
              <div className="mb-8">
                <p className="text-slate-300 text-sm italic">
                  Model prediction based on provided road and accident conditions.
                </p>
              </div>
              
              <h3 className="text-sm text-slate-400 font-semibold mb-3">Model-Predicted Probabilities</h3>
              <div className="space-y-4 mb-8">
                {Object.entries(result.probabilities || {}).map(([label, prob]: any) => (
                  <div key={label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{label}</span>
                      <span className="font-bold">{(prob * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div className={`h-2 rounded-full ${label === 'Fatal' ? 'bg-red-500' : label === 'Serious' ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${prob * 100}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-slate-900 border border-slate-700 p-4 rounded-lg">
                <h3 className="text-sm font-bold text-slate-200 mb-2">Important Model Factors</h3>
                <ul className="text-sm text-slate-400 list-disc list-inside mb-3 space-y-1">
                  <li>Time of day (Hour)</li>
                  <li>Speed limit</li>
                  <li>Urban vs Rural Environment</li>
                  <li>Light & Weather Conditions</li>
                </ul>
                <p className="text-xs text-slate-500 italic">
                  Note: These are model-relevant factors based on Random Forest feature importance, not proof of causation.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
