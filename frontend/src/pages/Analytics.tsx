import { BarChart3, Database, CheckCircle, Activity } from 'lucide-react';

export default function Analytics() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-100 flex items-center space-x-3">
          <BarChart3 className="w-8 h-8 text-cyan-400" />
          <span>Analytics & Machine Learning</span>
        </h1>
        <p className="text-slate-400 mt-1">Reported study results and data source connections</p>
      </div>

      <div className="bg-card1 p-6 rounded-xl border border-card2">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Model Performance Comparison</h2>
        <p className="text-xs text-slate-500 italic mb-4">Note: Reported Study Results (not reproduced in live simulation).</p>
        
        <table className="w-full text-sm text-left">
          <thead className="bg-bg2 text-slate-400 uppercase text-xs border-b border-card2">
            <tr>
              <th className="px-4 py-3">Model</th>
              <th className="px-4 py-3">Accuracy</th>
              <th className="px-4 py-3">Precision</th>
              <th className="px-4 py-3">Recall</th>
              <th className="px-4 py-3">F1-Score</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-card2">
              <td className="px-4 py-3 text-slate-300">Logistic Regression</td>
              <td className="px-4 py-3 text-slate-400">78.6%</td>
              <td className="px-4 py-3 text-slate-400">78.6%</td>
              <td className="px-4 py-3 text-slate-400">76.8%</td>
              <td className="px-4 py-3 text-slate-400">77.3%</td>
            </tr>
            <tr className="border-b border-card2">
              <td className="px-4 py-3 text-slate-300">Random Forest</td>
              <td className="px-4 py-3 text-slate-400">84.7%</td>
              <td className="px-4 py-3 text-slate-400">84.1%</td>
              <td className="px-4 py-3 text-slate-400">83.5%</td>
              <td className="px-4 py-3 text-slate-400">83.8%</td>
            </tr>
            <tr className="border-b border-card2">
              <td className="px-4 py-3 text-slate-300">XGBoost</td>
              <td className="px-4 py-3 text-slate-400">88.9%</td>
              <td className="px-4 py-3 text-slate-400">88.5%</td>
              <td className="px-4 py-3 text-slate-400">87.8%</td>
              <td className="px-4 py-3 text-slate-400">88.1%</td>
            </tr>
            <tr className="bg-cyan-500/10 border-b border-cyan-500/30">
              <td className="px-4 py-3 font-bold text-cyan-400 flex items-center space-x-2"><Activity className="w-4 h-4"/><span>Highway Guardian (CARF)</span></td>
              <td className="px-4 py-3 font-bold text-cyan-400">93.6%</td>
              <td className="px-4 py-3 font-bold text-cyan-400">93.2%</td>
              <td className="px-4 py-3 font-bold text-cyan-400">92.8%</td>
              <td className="px-4 py-3 font-bold text-cyan-400">93.0%</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="bg-card1 p-6 rounded-xl border border-card2">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center space-x-2"><Database className="w-4 h-4"/><span>Data Source Monitoring</span></h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {[
            { n: 'Vehicle Sensors', t: '1 sec ago' },
            { n: 'Weather API/Data', t: '12 sec ago' },
            { n: 'Traffic Data', t: '5 sec ago' },
            { n: 'GPS', t: '1 sec ago' },
            { n: 'Accident Database', t: '1 hr ago' },
            { n: 'Near-Miss Memory', t: 'Active' },
          ].map(s => (
            <div key={s.n} className="bg-bg2 p-4 rounded-lg border border-card2">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-200">{s.n}</span>
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>
              <p className="text-xs text-slate-500">Connected • <span className="text-cyan-400">{s.t}</span></p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
