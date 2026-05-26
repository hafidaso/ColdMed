import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, ReferenceLine
} from 'recharts';
import { ThermometerSun, Info } from 'lucide-react';

export const ThermalAnalysis: React.FC = () => {
  const { batches, loading, error } = useData();

  const tempChartData = useMemo(() => {
    return [...batches]
      .sort((a, b) => b.temperature_max - a.temperature_max)
      .map(b => ({
        name: b.batch_id,
        maxTemp: b.temperature_max,
        minTemp: b.temperature_min
      }));
  }, [batches]);

  const hoursChartData = useMemo(() => {
    return [...batches]
      .filter(b => b.heures_hors_limite_max > 0)
      .sort((a, b) => b.heures_hors_limite_max - a.heures_hors_limite_max)
      .map(b => ({
        name: b.batch_id,
        hours: b.heures_hors_limite_max
      }));
  }, [batches]);

  const envChartData = useMemo(() => [
    { name: "Ultra-low temp freezer", temp: -70 },
    { name: "Reefer truck", temp: 3 },
    { name: "Local transport", temp: 3 },
    { name: "Vaccination room", temp: 3 },
    { name: "Vaccine storage unit", temp: 4 },
    { name: "Discarded vaccine storage", temp: 12 }
  ].sort((a, b) => a.temp - b.temp), []);

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-900"></div></div>;
  if (error) return <div className="p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Analyse thermique</h1>
        <p className="text-sm text-slate-500 mt-1">Évaluation des régimes thermiques et détection des anomalies.</p>
      </div>

      <div className="bg-ice-50 border border-ice-100 rounded-xl p-5 shadow-sm flex gap-4 items-start">
        <Info className="text-ice-600 shrink-0 mt-0.5" size={20} />
        <div>
          <h3 className="text-sm font-bold text-ice-900">Régimes thermiques multiples</h3>
          <p className="text-sm text-slate-600 mt-1">
            La chaîne du froid observée comprend plusieurs régimes thermiques. Une température de -70°C peut être 
            cohérente avec une phase d'ultra-basse température, tandis qu'une température élevée dans une phase 
            réfrigérée constitue un signal nécessitant une revue qualité.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <h3 className="font-bold text-navy-900 mb-4 flex items-center gap-2">
          <ThermometerSun size={18} className="text-slate-400" /> Température médiane observée par environnement de stockage
        </h3>
        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={envChartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" interval={0} tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} unit="°C" />
              <RechartsTooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: any) => [`${value}°C`, 'Température médiane']}
              />
              <ReferenceLine y={0} stroke="#94a3b8" />
              <Bar dataKey="temp" radius={0}>
                {envChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.temp < 0 ? '#3b82f6' : entry.temp > 8 ? '#ef4444' : '#10b981'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-center text-slate-500 mt-2">
          Ce graphique illustre la variabilité normale des régimes thermiques rencontrés au cours du parcours logistique.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <h3 className="font-bold text-navy-900 mb-4 flex items-center gap-2">
            <ThermometerSun size={18} className="text-slate-400" /> Températures maximales observées par lot
          </h3>
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tempChartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} interval={0} tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} unit="°C" />
                <RechartsTooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <ReferenceLine y={8} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'top', value: 'Seuil 8°C', fill: '#ef4444', fontSize: 12 }} />
                <Bar dataKey="maxTemp" radius={[4, 4, 0, 0]}>
                  {tempChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.maxTemp > 8 ? '#ef4444' : '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-center text-slate-500 mt-2 px-4">
            La ligne de 8°C représente un seuil descriptif de vigilance pour les phases réfrigérées uniquement. Elle ne constitue pas une règle universelle pour l’ensemble du parcours.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <h3 className="font-bold text-navy-900 mb-4 flex items-center gap-2">
            <ThermometerSun size={18} className="text-slate-400" /> Durée hors limite enregistrée dans le dataset
          </h3>
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hoursChartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} interval={0} tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} unit="h" />
                <RechartsTooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <ReferenceLine y={5} stroke="#f97316" strokeDasharray="3 3" label={{ position: 'top', value: 'Seuil de priorisation analytique : ≥ 5 h', fill: '#f97316', fontSize: 12 }} />
                <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                  {hoursChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.hours >= 5 ? '#f97316' : '#fcd34d'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-center text-slate-500 mt-2">
            Seuls les lots ayant enregistré des heures hors limite sont affichés.
          </p>
        </div>
      </div>
    </div>
  );
};
