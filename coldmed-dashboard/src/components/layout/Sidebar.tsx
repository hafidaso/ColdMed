import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Eye, Thermometer, ShieldAlert, Truck, FileText, Wifi, BrainCircuit } from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { name: "Vue d'ensemble", path: '/', icon: LayoutDashboard },
  { name: "Surveillance des lots", path: '/surveillance', icon: Eye },
  { name: "Analyse thermique", path: '/analyse', icon: Thermometer },
  { name: "Revue qualité", path: '/revue', icon: ShieldAlert },
  { name: "Traçabilité logistique", path: '/tracabilite', icon: Truck },
  { name: "Intelligence analytique", path: '/intelligence-analytique', icon: BrainCircuit },
  { name: "Audit & rapports", path: '/audit', icon: FileText },
  { name: "Extension IoT", path: '/iot', icon: Wifi },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-navy-900 text-white flex flex-col h-screen fixed top-0 left-0">
      <div className="p-6">
        <h1 className="text-xl font-bold tracking-tight">ColdMed Trace</h1>
        <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">Prototype</p>
      </div>
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive 
                    ? 'bg-ice-500/20 text-ice-100 border border-ice-500/30' 
                    : 'text-slate-300 hover:bg-navy-800 hover:text-white'
                )
              }
            >
              <Icon size={18} />
              {item.name}
            </NavLink>
          );
        })}
      </nav>
      <div className="p-4 m-4 bg-navy-800 rounded-lg border border-navy-700">
        <p className="text-xs text-slate-400 text-center">
          Prototype académique<br/>
          <span className="font-semibold text-slate-300">v1.0.0</span>
        </p>
      </div>
    </aside>
  );
};
