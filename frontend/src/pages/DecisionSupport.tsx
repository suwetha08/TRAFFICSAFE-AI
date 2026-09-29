import { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertTriangle, CheckCircle, ShieldAlert, Lightbulb, ChevronDown, ChevronUp, BarChart3, Info } from 'lucide-react';

const priorityConfig: Record<string, { badge: string; bar: string; border: string }> = {
  HIGH:   { badge: 'bg-red-500/20 text-red-400 border border-red-700',    bar: 'bg-red-500',    border: 'border-red-800' },
  MEDIUM: { badge: 'bg-amber-500/20 text-amber-400 border border-amber-700', bar: 'bg-amber-500', border: 'border-amber-800' },
  LOW:    { badge: 'bg-green-500/20 text-green-400 border border-green-700', bar: 'bg-green-500',  border: 'border-green-800' },
};

function InterventionCard({ item, rank }: { item: any; rank: number }) {
  const [expanded, setExpanded] = useState(rank <= 2); // top 2 expanded by default
  const cfg = priorityConfig[item.priority] ?? priorityConfig.LOW;
  const pct = Math.round(item.importance * 100 * 10) / 10;

  return (
    <div className={`bg-slate-800 rounded-xl border ${cfg.border} overflow-hidden transition-all`}>
      {/* Header */}
      <button
        className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-700/40 transition"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center space-x-4">
          <span className="text-slate-500 font-mono text-sm w-6">#{rank}</span>
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <h3 className="font-bold text-slate-100">{item.label}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${cfg.badge}`}>
                {item.priority} PRIORITY
              </span>
            </div>
            {/* Importance bar */}
            <div className="flex items-center space-x-3">
              <div className="w-40 bg-slate-700 rounded-full h-1.5">
                <div className={`h-1.5 rounded-full ${cfg.bar}`} style={{ width: `${Math.min(pct * 3, 100)}%` }}></div>
              </div>
              <span className="text-xs text-slate-400 font-mono">Model weight: {pct}%</span>
            </div>
          </div>
        </div>
        {expanded ? <ChevronUp className="text-slate-400 w-5 h-5 flex-shrink-0" /> : <ChevronDown className="text-slate-400 w-5 h-5 flex-shrink-0" />}
      </button>

      {/* Expandable body */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-slate-700/60 pt-4 space-y-4">
          {/* Model insight */}
          <div className="flex items-start space-x-2 bg-slate-700/40 rounded-lg p-3">
            <Info className="text-blue-400 w-4 h-4 mt-0.5 flex-shrink-0" />
            <p className="text-slate-300 text-sm">{item.insight}</p>
          </div>

          {/* Recommendations */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1">
              <Lightbulb className="w-3.5 h-3.5" /><span>Recommended Interventions</span>
            </p>
            <ul className="space-y-2">
              {item.recommendations.map((rec: string, i: number) => (
                <li key={i} className="flex items-start space-x-2 text-sm text-slate-200">
                  <CheckCircle className="text-green-500 w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DecisionSupport() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios.get('http://localhost:8000/api/decision-support')
      .then(res => { setData(res.data); setLoading(false); })
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
          <p className="text-slate-400">Generating decision support intelligence...</p>
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

  const highCount   = data.interventions.filter((i: any) => i.priority === 'HIGH').length;
  const medCount    = data.interventions.filter((i: any) => i.priority === 'MEDIUM').length;
  const lowCount    = data.interventions.filter((i: any) => i.priority === 'LOW').length;

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-1">Decision Support</h1>
        <p className="text-slate-400">
          Model-driven intelligence for traffic safety planners — ranked by Random Forest feature importance.
        </p>
      </div>

      {/* Disclaimer */}
      <div className="bg-blue-900/30 border border-blue-700 rounded-xl p-4 flex items-start space-x-3">
        <ShieldAlert className="text-blue-400 w-5 h-5 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-200">
          <span className="font-semibold">Important: </span>{data.disclaimer}
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 text-center">
          <p className="text-2xl font-bold text-slate-100">{data.interventions.length}</p>
          <p className="text-slate-400 text-sm mt-1">Intervention Areas</p>
        </div>
        <div className="bg-slate-800 rounded-xl border border-red-800 p-4 text-center">
          <p className="text-2xl font-bold text-red-400">{highCount}</p>
          <p className="text-slate-400 text-sm mt-1">High Priority</p>
        </div>
        <div className="bg-slate-800 rounded-xl border border-amber-800 p-4 text-center">
          <p className="text-2xl font-bold text-amber-400">{medCount}</p>
          <p className="text-slate-400 text-sm mt-1">Medium Priority</p>
        </div>
        <div className="bg-slate-800 rounded-xl border border-green-800 p-4 text-center">
          <p className="text-2xl font-bold text-green-400">{lowCount}</p>
          <p className="text-slate-400 text-sm mt-1">Low Priority</p>
        </div>
      </div>

      {/* Model metadata */}
      <div className="flex items-center space-x-6 text-sm text-slate-400 bg-slate-800/60 border border-slate-700 rounded-lg px-5 py-3">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-4 h-4 text-blue-400" />
          <span>Algorithm: <span className="text-slate-200 font-semibold">{data.model_algorithm}</span></span>
        </div>
        <div className="w-px h-4 bg-slate-600"></div>
        <span>Features analysed: <span className="text-slate-200 font-semibold">{data.total_features_analysed}</span></span>
        <div className="w-px h-4 bg-slate-600"></div>
        <span>Ranked by: <span className="text-slate-200 font-semibold">Model Feature Importance (descending)</span></span>
      </div>

      {/* Intervention Cards */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-100">Strategic Intervention Recommendations</h2>
        {data.interventions.map((item: any, i: number) => (
          <InterventionCard key={item.label} item={item} rank={i + 1} />
        ))}
      </div>
    </div>
  );
}
