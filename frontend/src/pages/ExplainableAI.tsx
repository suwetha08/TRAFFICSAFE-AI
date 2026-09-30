import { useState, useEffect } from 'react';
import axios from 'axios';
import { Cpu } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function ExplainableAI() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetch = () => axios.get('http://localhost:8000/api/explain').then(res => setData(res.data)).catch(()=>{});
    fetch();
    const interval = setInterval(fetch, 2000);
    return () => clearInterval(interval);
  }, []);

  if (!data) return <div className="p-8 text-slate-500">Loading SHAP explanations...</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-100 flex items-center space-x-3">
          <Cpu className="w-8 h-8 text-cyan-400" />
          <span>Explainable AI</span>
        </h1>
        <p className="text-slate-400 mt-1">Why did Highway Guardian classify this situation as high risk?</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-card1 p-6 rounded-xl border border-card2 text-center">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Prediction</p>
          <p className={`text-4xl font-black ${data.prediction === 'CRITICAL' ? 'text-red-500' : data.prediction === 'HIGH' ? 'text-orange-500' : data.prediction === 'MODERATE' ? 'text-yellow-500' : 'text-green-500'}`}>{data.prediction}</p>
        </div>
        <div className="bg-card1 p-6 rounded-xl border border-card2 text-center">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Confidence</p>
          <p className="text-4xl font-black text-cyan-400">{data.confidence}%</p>
        </div>
        <div className="bg-card1 p-6 rounded-xl border border-card2">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Primary Contributors</p>
          <p className="text-sm text-slate-300 leading-relaxed">{data.explanation}</p>
        </div>
      </div>

      <div className="bg-card1 p-8 rounded-xl border border-card2">
        <h2 className="text-lg font-bold text-slate-200 mb-6">SHAP-style Feature Contribution</h2>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={data.factors} margin={{top: 5, right: 30, left: 100, bottom: 5}}>
              <XAxis type="number" domain={[-20, 30]} stroke="#475569" />
              <YAxis dataKey="name" type="category" stroke="#94A3B8" width={150} tick={{fill: '#CBD5E1', fontSize: 12}} />
              <Tooltip cursor={{fill: '#14243A'}} contentStyle={{backgroundColor: '#111F33', border: '1px solid #1e293b', color: '#fff'}} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {data.factors.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color === 'red' ? '#EF4444' : '#22C55E'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center space-x-6 mt-4 text-sm text-slate-400">
          <span className="flex items-center space-x-2"><div className="w-3 h-3 bg-red-500 rounded"></div><span>Increases Risk</span></span>
          <span className="flex items-center space-x-2"><div className="w-3 h-3 bg-green-500 rounded"></div><span>Decreases Risk</span></span>
        </div>
      </div>
    </div>
  );
}
