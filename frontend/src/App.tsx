import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Overview from './pages/Overview';
import DataIntelligence from './pages/DataIntelligence';
import ModelPerformance from './pages/ModelPerformance';
import LivePrediction from './pages/LivePrediction';
import Explainability from './pages/Explainability';
import DecisionSupport from './pages/DecisionSupport';
import { ShieldAlert, Activity, Database, BarChart3, Settings, PlayCircle, HelpCircle } from 'lucide-react';

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-slate-900 text-slate-50">
        {/* Sidebar */}
        <div className="w-64 bg-slate-800 border-r border-slate-700 p-4">
          <div className="flex items-center space-x-2 mb-8 mt-2">
            <ShieldAlert className="text-blue-500 w-8 h-8" />
            <div>
              <h1 className="font-bold text-xl tracking-wider">TRAFFICSAFE <span className="text-blue-500">AI</span></h1>
            </div>
          </div>
          
          <nav className="space-y-2 text-slate-300">
            <Link to="/" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-700 transition">
              <Activity className="w-5 h-5" />
              <span>Overview</span>
            </Link>
            <Link to="/data" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-700 transition">
              <Database className="w-5 h-5" />
              <span>Data Intelligence</span>
            </Link>
            <Link to="/performance" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-700 transition">
              <BarChart3 className="w-5 h-5" />
              <span>Model Performance</span>
            </Link>
            <Link to="/predict" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-600 bg-blue-700/20 text-blue-400 transition">
              <PlayCircle className="w-5 h-5" />
              <span>Live Prediction</span>
            </Link>
            <Link to="/explainability" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-700 transition">
              <HelpCircle className="w-5 h-5" />
              <span>Explainability</span>
            </Link>
            <Link to="/decision" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-700 transition">
              <Settings className="w-5 h-5" />
              <span>Decision Support</span>
            </Link>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto bg-slate-900">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/data" element={<DataIntelligence />} />
            <Route path="/performance" element={<ModelPerformance />} />
            <Route path="/predict" element={<LivePrediction />} />
            <Route path="/explainability" element={<Explainability />} />
            <Route path="/decision" element={<DecisionSupport />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
