import React from 'react';
import { useData } from '../context/DataContext';
import { FileText, Download, CheckCircle, Clock } from 'lucide-react';

export const AuditReports: React.FC = () => {
  const { batches, loading, error } = useData();

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-900"></div></div>;
  if (error) return <div className="p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>;

  const mockAudits = batches.slice(0, 8).map((b, index) => ({
    id: `AUD-${1000 + index}`,
    batch_id: b.batch_id,
    date: new Date(Date.now() - Math.random() * 10000000000).toLocaleDateString('fr-FR'),
    reviewer: ["Responsable qualité — simulation", "Agent de revue — simulation", "Workflow analytique — simulation"][index % 3],
    decision: b.issue_finale_observee === "Livré au site de vaccination" ? "Validé" : (index % 2 === 0 ? "Écart observé documenté" : "Investigation enregistrée"),
    status: index % 2 === 0 ? "Clôturé" : "Ouvert"
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Audit & Rapports</h1>
          <p className="text-sm text-slate-500 mt-1">Simulation d’un registre de revue qualité et génération de rapports de traçabilité.</p>
        </div>
        <button 
          className="flex items-center gap-2 bg-navy-900 hover:bg-navy-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors opacity-70 cursor-not-allowed"
          title="Fonction d’export prévue dans une prochaine version."
          disabled
        >
          <Download size={16} /> Exporter le rapport prototype
        </button>
      </div>

      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg shadow-sm">
        <h3 className="text-sm font-bold text-amber-800">Avertissement de conformité</h3>
        <p className="text-sm text-amber-700 mt-1">
          Les décisions qualité présentées dans cette interface sont simulées pour les besoins du prototype et ne constituent pas des décisions réglementaires réelles.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-navy-900 flex items-center gap-2">
            <FileText size={18} className="text-slate-400" /> Registre d'audit (Mockup)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-4 font-semibold">ID Audit</th>
                <th className="p-4 font-semibold">Batch ID</th>
                <th className="p-4 font-semibold">Date de revue</th>
                <th className="p-4 font-semibold">Rôle simulé</th>
                <th className="p-4 font-semibold">Action de revue simulée</th>
                <th className="p-4 font-semibold">Statut du workflow simulé</th>
                <th className="p-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockAudits.map(audit => (
                <tr key={audit.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-medium text-navy-900">{audit.id}</td>
                  <td className="p-4 text-slate-600">{audit.batch_id}</td>
                  <td className="p-4 text-slate-600">{audit.date}</td>
                  <td className="p-4 text-slate-600">{audit.reviewer}</td>
                  <td className="p-4">
                    <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                      audit.decision === 'Validé' ? 'bg-emerald-100 text-emerald-800' : 
                      audit.decision === 'Écart observé documenté' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      {audit.decision}
                    </span>
                  </td>
                  <td className="p-4">
                    {audit.status === 'Clôturé' ? (
                      <span className="flex items-center gap-1 text-emerald-600 text-xs font-medium"><CheckCircle size={14} /> Clôturé</span>
                    ) : (
                      <span className="flex items-center gap-1 text-orange-600 text-xs font-medium"><Clock size={14} /> Ouvert</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      className="text-slate-400 hover:text-navy-900 transition-colors opacity-50 cursor-not-allowed"
                      title="Fonction d’export prévue dans une prochaine version."
                      disabled
                    >
                      <Download size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
