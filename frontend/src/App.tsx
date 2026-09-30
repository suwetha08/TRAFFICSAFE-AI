import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { LayoutDashboard, Car, Map, ShieldAlert, FileText, Bell } from 'lucide-react';
import Overview from './pages/Overview';
import LivePrediction from './pages/LivePrediction';
import DriverView from './pages/DriverView';
import AccidentIntelligence from './pages/AccidentIntelligence';
import Alerts from './pages/Alerts';

export default function App() {
  return (
    <Router>
      <div className="flex h-screen bg-[#0b1120] text-slate-200 font-sans">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
          <div className="p-6 border-b border-slate-800">
            <div className="flex items-center space-x-3 text-blue-500 font-bold text-xl tracking-tight">
              <ShieldAlert className="w-8 h-8" />
              <div className="leading-tight">
                <span className="block text-slate-100">HIGHWAY</span>
                <span className="block text-blue-500">GUARDIAN</span>
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-500 uppercase tracking-wider font-semibold">Intelligent Monitoring</p>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-4 px-3">Authority</div>
            <NavLink to="/" className={({isActive}) => `flex items-center space-x-3 px-3 py-2.5 rounded-lg transition ${isActive ? 'bg-blue-600/20 text-blue-400' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
              <LayoutDashboard className="w-5 h-5" /><span>Dashboard</span>
            </NavLink>
            <NavLink to="/predict" className={({isActive}) => `flex items-center space-x-3 px-3 py-2.5 rounded-lg transition ${isActive ? 'bg-blue-600/20 text-blue-400' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
              <FileText className="w-5 h-5" /><span>Accident Prediction</span>
            </NavLink>
            <NavLink to="/alerts" className={({isActive}) => `flex items-center space-x-3 px-3 py-2.5 rounded-lg transition ${isActive ? 'bg-blue-600/20 text-blue-400' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
              <Bell className="w-5 h-5" /><span>Alerts</span>
            </NavLink>

            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-8 px-3">Drivers</div>
            <NavLink to="/driver" className={({isActive}) => `flex items-center space-x-3 px-3 py-2.5 rounded-lg transition ${isActive ? 'bg-amber-600/20 text-amber-400' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
              <Car className="w-5 h-5" /><span>Driver Safety View</span>
            </NavLink>

            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-8 px-3">Data Science Core</div>
            <NavLink to="/intelligence" className={({isActive}) => `flex items-center space-x-3 px-3 py-2.5 rounded-lg transition ${isActive ? 'bg-purple-600/20 text-purple-400' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
              <Map className="w-5 h-5" /><span>Accident Intelligence</span>
            </NavLink>
          </nav>
          
          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center space-x-2 text-xs text-slate-500">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span>System Online</span>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto relative">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/predict" element={<LivePrediction />} />
            <Route path="/driver" element={<DriverView />} />
            <Route path="/intelligence" element={<AccidentIntelligence />} />
            <Route path="/alerts" element={<Alerts />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
