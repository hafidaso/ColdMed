import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { 
  Package, CheckCircle, XOctagon, AlertTriangle, 
  Clock, ThermometerSun, AlertCircle, ChevronRight, ShieldAlert, BrainCircuit
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer 
} from 'recharts';
import { useNavigate } from 'react-router-dom';

const OUTCOME_COLORS: Record<string, string> = {
  "Livré au site de vaccination": "#10b981", // Vert
  "Écart explicite observé": "#f87171", // Rouge doux
  "Discordance à valider": "#f97316" // Orange
};

const PRIORITY_COLORS: Record<string, string> = {
  "Priorité critique - discordance à valider": "#ef4444",
  "Priorité critique - expiration observée": "#ef4444",
  "Priorité élevée - excursion thermique prolongée": "#f97316",
  "Surveillance - signal thermique enregistré": "#f59e0b",
  "Aucun signal identifié": "#10b981"
};

const SHORT_PRIORITY_LABELS: Record<string, string> = {
  "Priorité critique - discordance à valider": "Discordance",
  "Priorité critique - expiration observée": "Expiration observée",
  "Priorité élevée - excursion thermique prolongée": "Excursion prolongée",
  "Surveillance - signal thermique enregistré": "Surveillance",
  "Aucun signal identifié": "Conforme"
};

export const DashboardOverview: React.FC = () => {
  const { batches, anomalyFlaggedObservations, anomalyBatchSummary, anomalyTop5Priority, loading, error, isValid } = useData();
  const navigate = useNavigate();

  const stats = useMemo(() => {
    return {
      total: batches.length,
      delivered: batches.filter(b => b.issue_finale_observee === "Livré au site de vaccination").length,
      explicitDiscard: batches.filter(b => b.issue_finale_observee === "Écart explicite observé").length,
      discordant: batches.filter(b => b.issue_finale_observee === "Discordance à valider").length,
      expired: batches.filter(b => b.signal_expiration).length,
      prolonged: batches.filter(b => b.signal_excursion_prolongee).length,
      over8: batches.filter(b => b.signal_temperature_superieure_8).length,
    };
  }, [batches]);

  const outcomeData = useMemo(() => {
    return [
      { name: "Livré au site de vaccination", value: stats.delivered },
      { name: "Écart explicite observé", value: stats.explicitDiscard },
      { name: "Discordance à valider", value: stats.discordant }
    ].filter(d => d.value > 0);
  }, [stats]);

  const priorityData = useMemo(() => {
    const counts: Record<string, number> = {};
    batches.forEach(b => {
      counts[b.niveau_revue_qualite] = (counts[b.niveau_revue_qualite] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ 
      fullName: name,
      shortName: SHORT_PRIORITY_LABELS[name] || name,
      value 
    }));
  }, [batches]);

  const priorityAlerts = useMemo(() => {
    // Sort logic based on severity
    const severityOrder: Record<string, number> = {
      "Priorité critique - discordance à valider": 1,
      "Priorité critique - expiration observée": 2,
      "Priorité élevée - excursion thermique prolongée": 3,
      "Surveillance - signal thermique enregistré": 4,
      "Aucun signal identifié": 5
    };
    return [...batches]
      .filter(b => b.niveau_revue_qualite !== "Aucun signal identifié")
      .sort((a, b) => {
        const orderA = severityOrder[a.niveau_revue_qualite] || 99;
        const orderB = severityOrder[b.niveau_revue_qualite] || 99;
        if (orderA !== orderB) return orderA - orderB;
        return b.temperature_max - a.temperature_max;
      })
      .slice(0, 5); // top 5 alerts
  }, [batches]);

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-900"></div></div>;
  if (error) return <div className="p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>;

  return (
    <div className="space-y-6">
      {!isValid && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg shadow-sm flex gap-3">
          <AlertCircle className="text-amber-500 shrink-0" />
          <div>
            <h3 className="text-sm font-bold text-amber-800">Avertissement de validation des données</h3>
            <p className="text-xs text-amber-700 mt-1">
              Les calculs dynamiques divergent des résultats attendus (ex: 30 lots, 10 livrés, 17 écarts...).
              Assurez-vous d'avoir importé les bons fichiers CSV corrigés.
            </p>
          </div>
        </div>
      )}

      <div className="bg-ice-50 border border-ice-100 rounded-xl p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-ice-800 flex items-center gap-2">
          <ShieldAlert size={16} /> Notice d'intégrité des données
        </h2>
        <p className="text-sm text-slate-600 mt-2">
          Les données analysées proviennent d'un dataset international de distribution vaccinale. 
          Le prototype vise à valider la logique de surveillance et pourra être adapté ultérieurement à un contexte local réel.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard title="Lots analysés" value={stats.total} icon={Package} subtitle="Périmètre d'analyse" color="bg-navy-900" />
        <KpiCard title="Livrés au site" value={stats.delivered} icon={CheckCircle} subtitle="Arrivée observée au site de vaccination" color="bg-alert-conforme" />
        <KpiCard title="Écart explicite" value={stats.explicitDiscard} icon={XOctagon} subtitle="Destination d’écart observée" color="bg-alert-critical" />
        <KpiCard title="Discordance" value={stats.discordant} icon={AlertTriangle} subtitle="Revue qualité requise" color="bg-alert-high" />
        <KpiCard title="Expirations" value={stats.expired} icon={Clock} subtitle="Expiration observée dans les données" color="bg-alert-critical" />
        <KpiCard title="Excursions" value={stats.prolonged} icon={ThermometerSun} subtitle="≥ 5 h hors limite" color="bg-alert-surveillance" />
      </div>

      <div 
        onClick={() => navigate('/intelligence-analytique')}
        className="bg-white rounded-xl shadow-sm border border-ice-200 p-4 flex flex-col sm:flex-row items-center justify-between cursor-pointer hover:bg-ice-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-ice-100 text-ice-600 rounded-lg">
            <BrainCircuit size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-navy-900">Intelligence analytique</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">EXPLORATOIRE</span>
            </div>
            <div className="flex gap-4 mt-1 text-sm text-slate-600">
              <span><strong className="text-navy-900">{anomalyFlaggedObservations?.length || 0}</strong> profils signalés</span>
              <span className="text-slate-300">•</span>
              <span><strong className="text-navy-900">{anomalyBatchSummary?.length || 0}</strong> lots concernés</span>
              <span className="text-slate-300">•</span>
              <span><strong className="text-navy-900">{anomalyTop5Priority?.length || 0}</strong> lots dans le Top 5 prioritaire</span>
            </div>
          </div>
        </div>
        <ChevronRight className="text-ice-400 hidden sm:block" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-navy-900">Alertes prioritaires (Top 5)</h3>
            <button onClick={() => navigate('/revue')} className="text-sm text-ice-500 font-medium hover:underline flex items-center">
              Voir tout <ChevronRight size={16} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="p-3 rounded-tl-lg font-medium">Batch ID</th>
                  <th className="p-3 font-medium">Niveau de revue</th>
                  <th className="p-3 font-medium">Issue Finale</th>
                  <th className="p-3 font-medium">T. Max</th>
                  <th className="p-3 rounded-tr-lg font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {priorityAlerts.map(alert => (
                  <tr key={alert.batch_id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-medium text-navy-900">{alert.batch_id}</td>
                    <td className="p-3">
                      <span className="inline-flex px-2 py-1 rounded text-xs font-semibold" style={{
                        backgroundColor: `${PRIORITY_COLORS[alert.niveau_revue_qualite]}15`,
                        color: PRIORITY_COLORS[alert.niveau_revue_qualite]
                      }}>
                        {alert.niveau_revue_qualite}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600">{alert.issue_finale_observee}</td>
                    <td className="p-3">
                      <span className={`font-semibold ${alert.temperature_max > 8 ? 'text-red-500' : 'text-slate-700'}`}>
                        {alert.temperature_max}°C
                      </span>
                    </td>
                    <td className="p-3">
                      <button 
                        onClick={() => navigate(`/lot/${alert.batch_id}`)}
                        className="text-xs bg-white border border-slate-200 hover:bg-slate-50 text-navy-700 px-3 py-1.5 rounded-md font-medium transition-colors"
                      >
                        Examiner
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col">
          <h3 className="font-bold text-navy-900 mb-4">Distribution des issues</h3>
          <div style={{ width: '100%', height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={outcomeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {outcomeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={OUTCOME_COLORS[entry.name] || '#94a3b8'} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-2 mt-4 px-2">
            <div className="flex justify-between items-center text-sm font-semibold text-slate-700">
              <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-400"></div> Écarts explicites</span>
              <span>{stats.explicitDiscard}</span>
            </div>
            <div className="flex justify-between items-center text-sm font-semibold text-slate-700">
              <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> Livrés au site</span>
              <span>{stats.delivered}</span>
            </div>
            <div className="flex justify-between items-center text-sm font-semibold text-slate-700">
              <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-500"></div> Discordances</span>
              <span>{stats.discordant}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <h3 className="font-bold text-navy-900 mb-4">Répartition des niveaux de revue qualité</h3>
        <div style={{ width: '100%', height: 256 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={priorityData} layout="vertical" margin={{ top: 5, right: 30, left: 150, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis type="number" />
              <YAxis dataKey="shortName" type="category" width={140} tick={{ fontSize: 11, fill: '#475569' }} />
              <RechartsTooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                labelFormatter={(label) => {
                  const entry = priorityData.find(d => d.shortName === label);
                  return entry ? entry.fullName : label;
                }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {priorityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.fullName] || '#94a3b8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

interface KpiCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  subtitle: string;
  color: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon: Icon, subtitle, color }) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col relative overflow-hidden group">
    <div className="flex justify-between items-start z-10">
      <div>
        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{title}</p>
        <h4 className="text-2xl font-bold text-navy-900 mt-1">{value}</h4>
      </div>
      <div className={`p-2 rounded-lg text-white ${color}`}>
        <Icon size={18} />
      </div>
    </div>
    <div className="mt-3 z-10">
      <p className="text-xs text-slate-400">{subtitle}</p>
    </div>
    <div className={`absolute -right-4 -bottom-4 w-16 h-16 rounded-full opacity-5 group-hover:scale-150 transition-transform duration-500 ${color}`}></div>
  </div>
);
