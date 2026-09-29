import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Explainability() {
  const [importance, setImportance] = useState<any[]>([]);

  useEffect(() => {
    axios.get('http://localhost:8000/api/feature-importance')
      .then(res => setImportance(res.data.slice(0, 10)))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Model Explainability</h1>
      
      <div className="bg-blue-900/30 border border-blue-800 p-4 rounded-lg mb-8">
        <p className="text-blue-200 text-sm">
          <strong>Note:</strong> Feature importance indicates which variables the Random Forest relied on most across the trained model. It does not establish that a feature caused an accident.
        </p>
      </div>

      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 h-[500px]">
        <h2 className="text-xl font-bold mb-6">Top 10 Model-Important Factors</h2>
        {importance.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={importance} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" stroke="#94a3b8" />
              <YAxis dataKey="feature" type="category" width={150} stroke="#94a3b8" tick={{fontSize: 12}} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569' }} />
              <Bar dataKey="importance" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-slate-400">Loading feature importance...</p>
        )}
      </div>
    </div>
  );
}
