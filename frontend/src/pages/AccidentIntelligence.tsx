import { useState, useEffect } from 'react';
import axios from 'axios';
import { Database, AlertTriangle, CheckCircle, Layers, Trash2, Wrench } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const PIE_COLORS = ['#22c55e', '#f59e0b', '#ef4444'];

const badgeColor: Record<string, string> = {
  Categorical: 'bg-blue-500/20 text-blue-400',
  Numerical: 'bg-purple-500/20 text-purple-400',
  Engineered: 'bg-amber-500/20 text-amber-400',
};

export default function AccidentIntelligence() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios.get('http://localhost:8000/api/metrics')
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Could not connect to backend. Make sure the FastAPI server is running on port 8000.');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading dataset statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-900/40 border border-red-600 rounded-xl p-6 flex items-start space-x-3">
          <AlertTriangle className="text-red-400 w-6 h-6 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-bold text-red-300">Backend Unavailable</p>
            <p className="text-red-400 text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-1">Accident Intelligence</h1>
        <p className="text-slate-400">Powered by the UK DfT dataset and Random Forest model.</p>
      </div>

      {/* Dataset Overview Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Records', value: data.total_rows.toLocaleString(), icon: <Database className="w-5 h-5 text-blue-400" />, color: 'border-blue-800' },
          { label: 'Total Columns', value: data.total_columns, icon: <Layers className="w-5 h-5 text-purple-400" />, color: 'border-purple-800' },
          { label: 'Missing Values', value: data.missing_values.toLocaleString(), icon: <AlertTriangle className="w-5 h-5 text-amber-400" />, color: 'border-amber-800' },
          { label: 'Duplicate Rows', value: data.duplicate_rows, icon: <CheckCircle className="w-5 h-5 text-green-400" />, color: 'border-green-800' },
        ].map((card) => (
          <div key={card.label} className={`bg-slate-800 rounded-xl border ${card.color} p-5`}>
            <div className="flex items-center justify-between mb-3">{card.icon}</div>
            <p className="text-2xl font-bold">{card.value}</p>
            <p className="text-slate-400 text-sm mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Dataset Source */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <h2 className="text-lg font-bold mb-3 flex items-center space-x-2"><Database className="w-5 h-5 text-blue-400" /><span>Dataset Information</span></h2>
        <div className="grid grid-cols-3 gap-6 text-sm">
          <div><p className="text-slate-400">Filename</p><p className="font-mono text-blue-300 mt-1">{data.filename}</p></div>
          <div><p className="text-slate-400">Source</p><p className="text-slate-200 mt-1">{data.source}</p></div>
          <div><p className="text-slate-400">Target Column</p><p className="text-slate-200 mt-1"><span className="font-mono bg-slate-700 px-2 py-0.5 rounded">{data.target}</span> â€” {data.target_description}</p></div>
        </div>
      </div>

      {/* Target Distribution */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-bold mb-4">Target Distribution (collision_severity)</h2>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={data.distribution} dataKey="count" nameKey="label" cx="50%" cy="50%" outerRadius={90} label={({ label, percentage }) => `${label} (${percentage}%)`} labelLine={false}>
                {data.distribution.map((_: any, i: number) => (
                  <Cell key={i} fill={PIE_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip formatter={(val: any) => val.toLocaleString()} contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-bold mb-4">Class Imbalance Analysis</h2>
          <div className="space-y-4">
            {data.distribution.map((d: any, i: number) => (
              <div key={d.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span style={{ color: PIE_COLORS[i] }} className="font-semibold">{d.label}</span>
                  <span className="text-slate-300">{d.count.toLocaleString()} <span className="text-slate-500">({d.percentage}%)</span></span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3">
                  <div className="h-3 rounded-full" style={{ width: `${d.percentage}%`, backgroundColor: PIE_COLORS[i] }}></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 p-3 bg-amber-900/30 border border-amber-700 rounded text-amber-300 text-xs">
            âš ï¸ Strong class imbalance â€” 75.8% Slight vs 1.5% Fatal. Model trained with <code>class_weight='balanced'</code> to compensate.
          </div>
        </div>
      </div>

      {/* Model Features */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center space-x-2"><Wrench className="w-5 h-5 text-green-400" /><span>Model Features Used for Training</span></h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 border-b border-slate-700">
                <th className="text-left py-2 pr-4">Feature Name</th>
                <th className="text-left py-2 pr-4">Type</th>
                <th className="text-left py-2">Description</th>
              </tr>
            </thead>
            <tbody>
              {data.model_features.map((f: any) => (
                <tr key={f.name} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition">
                  <td className="py-3 pr-4 font-mono text-blue-300">{f.name}</td>
                  <td className="py-3 pr-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${badgeColor[f.type]}`}>{f.type}</span>
                  </td>
                  <td className="py-3 text-slate-300">{f.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dropped / Leakage Columns */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center space-x-2"><Trash2 className="w-5 h-5 text-red-400" /><span>Dropped Columns &amp; Leakage Avoidance</span></h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 border-b border-slate-700">
                <th className="text-left py-2 pr-4">Column Name</th>
                <th className="text-left py-2">Reason for Dropping</th>
              </tr>
            </thead>
            <tbody>
              {data.dropped_columns.map((col: any) => (
                <tr key={col.name} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition">
                  <td className="py-3 pr-4 font-mono text-red-300">{col.name}</td>
                  <td className="py-3 text-slate-300">{col.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Model Performance */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <h2 className="text-lg font-bold mb-4">Random Forest Model Performance</h2>
        <p className="text-sm text-slate-400 mb-6">Actual evaluation metrics from the saved Data Science pipeline on the 20% test set.</p>
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-blue-400">{(data.accuracy * 100).toFixed(2)}%</p>
            <p className="text-sm text-slate-400 mt-1">Accuracy</p>
          </div>
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-amber-400">{(data.precision_macro * 100).toFixed(2)}%</p>
            <p className="text-sm text-slate-400 mt-1">Precision (Macro)</p>
          </div>
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-green-400">{(data.recall_macro * 100).toFixed(2)}%</p>
            <p className="text-sm text-slate-400 mt-1">Recall (Macro)</p>
          </div>
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-purple-400">{(data.f1_macro * 100).toFixed(2)}%</p>
            <p className="text-sm text-slate-400 mt-1">F1-Score (Macro)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
