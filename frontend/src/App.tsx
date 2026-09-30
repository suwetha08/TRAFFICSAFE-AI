import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Car, Activity, History, AlertTriangle, ShieldAlert, Cpu, BarChart3, Settings, Bell, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

// Import Pages
import Overview from './pages/Overview';
import LiveMonitoring from './pages/LiveMonitoring';
import RiskAnalysis from './pages/RiskAnalysis';
import NearMissMemory from './pages/NearMissMemory';
import IncidentManagement from './pages/IncidentManagement';
import EmergencyResponse from './pages/EmergencyResponse';
import ExplainableAI from './pages/ExplainableAI';
import Analytics from './pages/Analytics';
import SystemSettings from './pages/SystemSettings';

function TopBar() {
  const location = useLocation();
  const pageName = location.pathname === '/' ? 'Overview Dashboard' : 
                   location.pathname.substring(1).split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return (
    <header className="h-16 bg-card1 border-b border-card2 flex items-center justify-between px-6">
      <div className="font-bold text-lg text-slate-200">{pageName || 'Dashboard'}</div>
      
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1 rounded-full">
          <Zap className="w-4 h-4 text-yellow-500" />
          <span className="text-xs font-bold text-yellow-500 tracking-wider">DEMO MODE</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-sm font-semibold text-cyan-400">LIVE</span>
          <span className="text-xs text-slate-400 ml-2">Data stream connected • Updated 1 sec ago</span>
        </div>

        <div className="w-px h-6 bg-card2"></div>
        
        <button className="relative text-slate-400 hover:text-white transition">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-card1"></span>
        </button>
        
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-card2 flex items-center justify-center border border-slate-700">
            <span className="text-xs font-bold text-cyan-400">OP</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <Router>
      <div className="flex h-screen bg-bg1 text-slate-200 font-sans overflow-hidden">
        
        {/* Sidebar */}
        <aside className="w-64 bg-bg2 border-r border-card2 flex flex-col z-20">
          <div className="h-16 flex items-center px-6 border-b border-card2">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-6 h-6 text-cyan-400" />
              <div className="leading-tight">
                <span className="block text-slate-100 font-bold tracking-widest text-sm">HIGHWAY</span>
                <span className="block text-cyan-400 font-bold tracking-widest text-sm">GUARDIAN</span>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-3">
            <NavLink to="/" className={({isActive}) => `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm transition ${isActive ? 'bg-cyan-500/10 text-cyan-400 font-semibold' : 'text-slate-400 hover:bg-card1 hover:text-slate-200'}`}>
              <LayoutDashboard className="w-4 h-4" /><span>Overview</span>
            </NavLink>
            <NavLink to="/live-monitoring" className={({isActive}) => `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm transition ${isActive ? 'bg-cyan-500/10 text-cyan-400 font-semibold' : 'text-slate-400 hover:bg-card1 hover:text-slate-200'}`}>
              <Car className="w-4 h-4" /><span>Live Monitoring</span>
            </NavLink>
            <NavLink to="/risk-analysis" className={({isActive}) => `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm transition ${isActive ? 'bg-cyan-500/10 text-cyan-400 font-semibold' : 'text-slate-400 hover:bg-card1 hover:text-slate-200'}`}>
              <Activity className="w-4 h-4" /><span>Risk Analysis</span>
            </NavLink>
            <NavLink to="/near-miss-memory" className={({isActive}) => `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm transition ${isActive ? 'bg-cyan-500/10 text-cyan-400 font-semibold' : 'text-slate-400 hover:bg-card1 hover:text-slate-200'}`}>
              <History className="w-4 h-4" /><span>Near-Miss Memory</span>
            </NavLink>
            <NavLink to="/incidents" className={({isActive}) => `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm transition ${isActive ? 'bg-cyan-500/10 text-cyan-400 font-semibold' : 'text-slate-400 hover:bg-card1 hover:text-slate-200'}`}>
              <AlertTriangle className="w-4 h-4" /><span>Incidents</span>
            </NavLink>
            <NavLink to="/emergency-response" className={({isActive}) => `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm transition ${isActive ? 'bg-cyan-500/10 text-cyan-400 font-semibold' : 'text-slate-400 hover:bg-card1 hover:text-slate-200'}`}>
              <ShieldAlert className="w-4 h-4" /><span>Emergency Response</span>
            </NavLink>
            <NavLink to="/explainable-ai" className={({isActive}) => `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm transition ${isActive ? 'bg-cyan-500/10 text-cyan-400 font-semibold' : 'text-slate-400 hover:bg-card1 hover:text-slate-200'}`}>
              <Cpu className="w-4 h-4" /><span>Explainable AI</span>
            </NavLink>
            <NavLink to="/analytics" className={({isActive}) => `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm transition ${isActive ? 'bg-cyan-500/10 text-cyan-400 font-semibold' : 'text-slate-400 hover:bg-card1 hover:text-slate-200'}`}>
              <BarChart3 className="w-4 h-4" /><span>Analytics</span>
            </NavLink>
            <NavLink to="/settings" className={({isActive}) => `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm transition ${isActive ? 'bg-cyan-500/10 text-cyan-400 font-semibold' : 'text-slate-400 hover:bg-card1 hover:text-slate-200'}`}>
              <Settings className="w-4 h-4" /><span>Settings</span>
            </NavLink>
          </nav>
          
          <div className="p-4 border-t border-card2 bg-bg3">
            <div className="flex flex-col space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">System Status</p>
              <div className="flex items-center space-x-2 text-sm text-green-400">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>All systems operational</span>
              </div>
              <p className="text-xs text-slate-500 mt-2 pt-2 border-t border-card2">User: Safety Control Operator</p>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col relative">
          <TopBar />
          <main className="flex-1 overflow-y-auto p-6 relative">
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/live-monitoring" element={<LiveMonitoring />} />
              <Route path="/risk-analysis" element={<RiskAnalysis />} />
              <Route path="/near-miss-memory" element={<NearMissMemory />} />
              <Route path="/incidents" element={<IncidentManagement />} />
              <Route path="/emergency-response" element={<EmergencyResponse />} />
              <Route path="/explainable-ai" element={<ExplainableAI />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<SystemSettings />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}
