import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ModelPerformance() {
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    axios.get('http://localhost:8000/api/metrics')
      .then(res => setMetrics(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Model Performance</h1>
      <p className="text-slate-400 mb-8">Random Forest Classifier Evaluation on Test Set</p>

      {metrics && (
        <div className="grid grid-cols-4 gap-6 mb-8">
          {['accuracy', 'precision_macro', 'recall_macro', 'f1_macro'].map((m) => (
            <div key={m} className="bg-slate-800 p-6 rounded-xl border border-slate-700 text-center">
              <h3 className="text-slate-400 text-sm mb-2 capitalize">{m.replace('_macro', '')}</h3>
              <p className="text-3xl font-bold text-blue-400">{(metrics[m] * 100).toFixed(2)}%</p>
            </div>
          ))}
        </div>
      )}
      
      {/* We will add Confusion Matrix and Classification Report later */}
    </div>
  );
}
