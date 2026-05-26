import React from 'react';
import { Download, Search, Calendar } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
      <div>
        <h2 className="text-2xl font-bold text-navy-900">ColdMed Trace</h2>
        <div className="flex items-center gap-3 mt-1">
          <p className="text-sm text-slate-500">Traçabilité intelligente de la chaîne du froid vaccinale</p>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-ice-100 text-ice-500">
            Prototype basé sur données internationales
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Rechercher un lot..." 
            className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ice-500/50 w-64 bg-slate-50"
          />
        </div>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Filtrer par date" 
            disabled
            className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-400 w-40 cursor-not-allowed"
          />
        </div>
        <button 
          className="flex items-center gap-2 bg-navy-900 hover:bg-navy-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors opacity-70 cursor-not-allowed"
          title="Fonction d’export prévue dans une prochaine version."
          disabled
        >
          <Download size={16} />
          Export prototype
        </button>
      </div>
    </header>
  );
};
