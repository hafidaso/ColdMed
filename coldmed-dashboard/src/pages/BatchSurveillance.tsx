import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Search, BrainCircuit, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PRIORITY_COLORS: Record<string, string> = {
  "Priorité critique - discordance à valider": "bg-red-50 text-red-700 border-red-200",
  "Priorité critique - expiration observée": "bg-red-50 text-red-700 border-red-200",
  "Priorité élevée - excursion thermique prolongée": "bg-orange-50 text-orange-700 border-orange-200",
  "Surveillance - signal thermique enregistré": "bg-amber-50 text-amber-700 border-amber-200",
  "Aucun signal identifié": "bg-emerald-50 text-emerald-700 border-emerald-200"
};

const OUTCOME_COLORS: Record<string, string> = {
  "Livré au site de vaccination": "bg-emerald-100 text-emerald-800",
  "Écart explicite observé": "bg-rose-100 text-rose-800",
  "Discordance à valider": "bg-orange-100 text-orange-800"
};

export const BatchSurveillance: React.FC = () => {
  const { batches, anomalyBatchSummary, loading, error } = useData();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterIssue, setFilterIssue] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [filterTemp, setFilterTemp] = useState(false);
  const [filterExp, setFilterExp] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredBatches = useMemo(() => {
    let result = [...batches];

    if (searchTerm) {
      result = result.filter(b => b.batch_id.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (filterIssue !== 'ALL') {
      result = result.filter(b => b.issue_finale_observee === filterIssue);
    }
    if (filterPriority !== 'ALL') {
      result = result.filter(b => b.niveau_revue_qualite === filterPriority);
    }
    if (filterTemp) {
      result = result.filter(b => b.signal_temperature_superieure_8);
    }
    if (filterExp) {
      result = result.filter(b => b.signal_expiration);
    }

    // Default sort by risk (highest first)
    const severityOrder: Record<string, number> = {
      "Priorité critique - discordance à valider": 1,
      "Priorité critique - expiration observée": 2,
      "Priorité élevée - excursion thermique prolongée": 3,
      "Surveillance - signal thermique enregistré": 4,
      "Aucun signal identifié": 5
    };
    
    result.sort((a, b) => {
      const orderA = severityOrder[a.niveau_revue_qualite] || 99;
      const orderB = severityOrder[b.niveau_revue_qualite] || 99;
      if (orderA !== orderB) return orderA - orderB;
      return b.temperature_max - a.temperature_max;
    });

    return result;
  }, [batches, searchTerm, filterIssue, filterPriority, filterTemp, filterExp]);

  const uniqueIssues = useMemo(() => Array.from(new Set(batches.map(b => b.issue_finale_observee))), [batches]);
  const uniquePriorities = useMemo(() => Array.from(new Set(batches.map(b => b.niveau_revue_qualite))), [batches]);

  const totalPages = Math.ceil(filteredBatches.length / itemsPerPage);
  const paginatedBatches = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredBatches.slice(start, start + itemsPerPage);
  }, [filteredBatches, currentPage]);

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterIssue, filterPriority, filterTemp, filterExp]);

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-900"></div></div>;
  if (error) return <div className="p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Surveillance des lots</h1>
        <p className="text-sm text-slate-500 mt-1">Gérez et examinez l'ensemble des lots de vaccins tracés.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex flex-col xl:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Rechercher</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="ID du lot..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-full focus:ring-2 focus:ring-ice-500/50 outline-none"
              />
            </div>
          </div>
          
          <div className="w-full xl:w-48">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Issue Finale</label>
            <select 
              value={filterIssue} 
              onChange={(e) => setFilterIssue(e.target.value)}
              className="w-full py-2 px-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-ice-500/50 outline-none"
            >
              <option value="ALL">Toutes les issues</option>
              {uniqueIssues.map(issue => <option key={issue} value={issue}>{issue}</option>)}
            </select>
          </div>

          <div className="w-full xl:w-64">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Priorité Revue</label>
            <select 
              value={filterPriority} 
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full py-2 px-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-ice-500/50 outline-none"
            >
              <option value="ALL">Toutes les priorités</option>
              {uniquePriorities.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-4 h-10 px-2">
            <label className="flex items-center gap-2 cursor-pointer group relative" title="Signal descriptif observé, principalement interprétable pour les phases réfrigérées.">
              <input type="checkbox" checked={filterTemp} onChange={(e) => setFilterTemp(e.target.checked)} className="rounded text-ice-500 focus:ring-ice-500" />
              <span className="text-sm font-medium text-slate-700 flex items-center gap-1 border-b border-dashed border-slate-400">
                Lecture max &gt; 8°C <Info size={12} className="text-slate-400" />
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={filterExp} onChange={(e) => setFilterExp(e.target.checked)} className="rounded text-ice-500 focus:ring-ice-500" />
              <span className="text-sm font-medium text-slate-700">Expiration</span>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-4 font-semibold">Batch ID</th>
                <th className="p-4 font-semibold text-center">Signal IA</th>
                <th className="p-4 font-semibold">Niveau de revue qualité</th>
                <th className="p-4 font-semibold">Issue finale observée</th>
                <th className="p-4 font-semibold" title="Température maximale du parcours">
                  <span className="border-b border-dashed border-slate-400 cursor-help">Max parcours</span>
                </th>
                <th className="p-4 font-semibold" title="Max dernière heure : valeur maximale parmi les lectures disponibles à la dernière heure observée.">
                  <span className="border-b border-dashed border-slate-400 cursor-help">Max dernière heure</span>
                </th>
                <th className="p-4 font-semibold">Hors limite (h)</th>
                <th className="p-4 font-semibold text-right sticky right-0 bg-slate-50 z-10 shadow-[-4px_0_6px_-2px_rgb(0,0,0,0.05)]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedBatches.length > 0 ? paginatedBatches.map(batch => (
                <tr 
                  key={batch.batch_id} 
                  onClick={() => navigate(`/lot/${batch.batch_id}`)}
                  className="group hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <td className="p-4 font-medium text-navy-900">{batch.batch_id}</td>
                  <td className="p-4 text-center">
                    {anomalyBatchSummary?.some(a => a.batch_id === batch.batch_id) ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-purple-100 text-purple-700 text-[10px] font-bold uppercase">
                        <BrainCircuit size={12} /> Profil signalé
                      </span>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-semibold border ${PRIORITY_COLORS[batch.niveau_revue_qualite] || 'bg-slate-100 text-slate-700'}`}>
                      {batch.niveau_revue_qualite}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${OUTCOME_COLORS[batch.issue_finale_observee] || 'bg-slate-100 text-slate-700'}`}>
                      {batch.issue_finale_observee}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`font-semibold ${batch.temperature_max > 8 ? 'text-red-600' : 'text-slate-700'}`}>
                      {batch.temperature_max}°C
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`font-semibold ${batch.temperature_finale_max > 8 ? 'text-red-600' : 'text-slate-700'}`}>
                      {batch.temperature_finale_max}°C
                    </span>
                  </td>
                  <td className="p-4 font-medium text-slate-700">
                    {batch.heures_hors_limite_max > 0 ? (
                      <span className={batch.heures_hors_limite_max >= 5 ? 'text-orange-600 font-bold' : ''}>{batch.heures_hors_limite_max} h</span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="p-4 text-right sticky right-0 bg-white group-hover:bg-slate-50 transition-colors z-10 shadow-[-4px_0_6px_-2px_rgb(0,0,0,0.05)]">
                    <button className="bg-navy-900 hover:bg-navy-800 text-white font-medium text-xs px-3 py-1.5 rounded-md transition-colors">
                      Voir le détail
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    Aucun lot ne correspond à ces filtres.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-slate-200 p-4 flex items-center justify-between bg-slate-50">
            <span className="text-sm text-slate-500">
              Affichage {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, filteredBatches.length)} sur {filteredBatches.length} lots
            </span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 rounded bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm font-medium text-slate-700 px-2">Page {currentPage} / {totalPages}</span>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1 rounded bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
