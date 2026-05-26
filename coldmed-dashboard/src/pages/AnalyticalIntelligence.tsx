import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { BrainCircuit, Info, AlertTriangle, Target } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  LineChart as RLineChart, Line, Scatter, ComposedChart, Cell
} from 'recharts';

export const AnalyticalIntelligence: React.FC = () => {
  const { 
    anomalyKpis, anomalyBatchSummary, anomalyTop5Priority, anomalyFlaggedObservations, 
    anomalyScores, anomalySensitivity, classificationMetrics, classificationFeatureImportance, 
    classificationPredictions, analyticalDataAvailable 
  } = useData();

  const [activeTab, setActiveTab] = useState<'anomaly' | 'classification'>('anomaly');
  const [selectedBatchForTimeline, setSelectedBatchForTimeline] = useState<string | null>(null);
  const [featureImportanceModel, setFeatureImportanceModel] = useState<'Decision Tree' | 'Logistic Regression'>('Decision Tree');

  if (!analyticalDataAvailable) {
    return (
      <div className="p-8 h-full flex flex-col items-center justify-center text-center">
        <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-100 max-w-lg">
          <AlertTriangle size={48} className="mx-auto mb-4 opacity-80" />
          <h2 className="text-lg font-semibold mb-2">Données analytiques manquantes</h2>
          <p className="text-sm">Résultats analytiques indisponibles — veuillez importer les exports validés du notebook Python dans le dossier public/data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 flex items-center gap-2">
            <BrainCircuit className="text-ice-500" />
            Intelligence Analytique
          </h1>
          <p className="text-slate-500 mt-1">
            Les résultats présentés constituent des signaux d’aide à la revue qualité. Ils ne représentent ni une cause officielle d’écart, ni une décision réglementaire automatique.
          </p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('anomaly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'anomaly' ? 'bg-white text-navy-900 shadow-sm' : 'text-slate-500 hover:text-navy-900'}`}
          >
            Détection d’atypicité thermique
          </button>
          <button 
            onClick={() => setActiveTab('classification')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'classification' ? 'bg-white text-navy-900 shadow-sm' : 'text-slate-500 hover:text-navy-900'}`}
          >
            Classification exploratoire
          </button>
        </div>
      </div>

      {activeTab === 'anomaly' ? (
        <AnomalyTab 
          kpis={anomalyKpis} 
          top5={anomalyTop5Priority} 
          batchSummary={anomalyBatchSummary} 
          observations={anomalyFlaggedObservations}
          scores={anomalyScores}
          sensitivity={anomalySensitivity}
          selectedBatch={selectedBatchForTimeline}
          setSelectedBatch={setSelectedBatchForTimeline}
        />
      ) : (
        <ClassificationTab 
          metrics={classificationMetrics}
          featureImportance={classificationFeatureImportance}
          predictions={classificationPredictions}
          selectedModel={featureImportanceModel}
          setSelectedModel={setFeatureImportanceModel}
        />
      )}
    </div>
  );
};

// --- Anomaly Tab Component ---

const AnomalyTab = ({ kpis, top5, batchSummary, observations, scores, sensitivity, selectedBatch, setSelectedBatch }: any) => {
  // Aggregate data for "Lots signalés selon le score maximal"
  const chartDataScores = batchSummary.map((b: any) => ({
    name: b.batch_id,
    score: b.anomaly_score_max,
    isTop5: top5.some((t: any) => t.batch_id === b.batch_id)
  })).sort((a: any, b: any) => b.score - a.score);

  // Timeline Data
  const timelineData = selectedBatch 
    ? scores.filter((s: any) => s.batch_id === selectedBatch).sort((a: any, b: any) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())
    : [];

  React.useEffect(() => {
    if (!selectedBatch && top5 && top5.length > 0) {
      setSelectedBatch(top5[0].batch_id);
    }
  }, [top5, selectedBatch, setSelectedBatch]);

  const hasSensitivityInconsistency = sensitivity.some((s: any) => s.nombre_lots_concernes > 30);



  return (
    <div className="space-y-6">
      {/* Methodological Banner */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 text-blue-800">
        <Info className="shrink-0 mt-0.5" size={20} />
        <div>
          <p className="text-sm font-medium">Le modèle Isolation Forest analyse uniquement les étapes logistiques communes précédant l’issue finale observée. Avec un paramètre exploratoire de contamination fixé à 2 %, il signale des profils thermiques atypiques à examiner. Ces signaux ne constituent pas une décision qualité automatique.</p>
          <p className="text-xs mt-1 text-blue-600/80">Le modèle est non supervisé (contamination=0.02) et les issues finales n'ont été jointes qu'à posteriori pour l'interprétation.</p>
        </div>
      </div>

      {hasSensitivityInconsistency && (
        <div className="bg-red-50 text-red-800 p-4 rounded-xl text-sm border border-red-200 flex gap-3">
          <AlertTriangle className="shrink-0 text-red-600" size={18} />
          <p>
            <strong>Incohérence détectée :</strong> le nombre de lots concernés dans la simulation de sensibilité dépasse le nombre total de lots analysés.
          </p>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {kpis.map((kpi: any, idx: number) => (
          <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center justify-center">
            <span className="text-2xl font-bold text-navy-900">{kpi.Valeur}</span>
            <span className="text-xs text-slate-500 mt-1 leading-tight">{kpi.KPI}</span>
          </div>
        ))}
      </div>

      {/* Top 5 Priority Panel */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-6">
        <div className="p-4 border-b border-slate-200 bg-amber-50">
          <h2 className="font-semibold text-amber-900 flex items-center gap-2 mb-3">
            <AlertTriangle size={18} />
            Top 5 des lots prioritaires selon le score d’atypicité
          </h2>
          <div className="bg-white text-slate-700 p-3 rounded-lg text-sm border border-amber-100 shadow-sm">
            <strong className="block mb-1 text-amber-900">Pourquoi certains profils sont-ils signalés malgré une température inférieure à 8°C ?</strong>
            Le modèle ne recherche pas uniquement les températures élevées. Il identifie également des écarts inhabituels par rapport au contexte thermique attendu de l’étape logistique observée.
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Rang</th>
                <th className="px-4 py-3">Batch ID</th>
                <th className="px-4 py-3">Étape signalée</th>
                <th className="px-4 py-3">Environnement observé</th>
                <th className="px-4 py-3">Score Max</th>
                <th className="px-4 py-3">Déviation Max</th>
                <th className="px-4 py-3">Issue Finale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {top5.map((row: any) => {
                const worstObs = observations.filter((o: any) => o.batch_id === row.batch_id).sort((a: any, b: any) => b.anomaly_score - a.anomaly_score)[0];
                return (
                  <tr key={row.batch_id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-amber-600">#{row.rang_priorite}</td>
                    <td className="px-4 py-3 font-medium text-navy-900">{row.batch_id}</td>
                    <td className="px-4 py-3 text-slate-600">{worstObs?.current_hop_clean || '-'}</td>
                    <td className="px-4 py-3 text-slate-600">{worstObs?.external_storage_clean || '-'}</td>
                    <td className="px-4 py-3 text-red-600 font-medium">{row.anomaly_score_max.toFixed(4)}</td>
                    <td className="px-4 py-3">{row.deviation_contextuelle_max.toFixed(1)}°C</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-red-100 text-red-700">
                        {row.issue_finale_observee}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-navy-900 mb-4">Lots signalés selon le score maximal</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartDataScores} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.5} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="score" name="Score d'atypicité Max" radius={[0, 4, 4, 0]}>
                  {chartDataScores.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.isTop5 ? '#f59e0b' : '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-navy-900 mb-4">Sensibilité au paramètre de contamination</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RLineChart data={sensitivity} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
                <XAxis dataKey="contamination" tickFormatter={(val) => `${(val*100).toFixed(0)}%`} />
                <YAxis yAxisId="left" label={{ value: 'Profils', angle: -90, position: 'insideLeft', style: { fill: '#64748b', fontSize: 11 } }} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 30]} label={{ value: 'Lots concernés', angle: 90, position: 'insideRight', style: { fill: '#64748b', fontSize: 11 } }} />
                <RechartsTooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="nombre_profils_signales" name="Profils signalés" stroke="#ef4444" activeDot={{ r: 8 }} />
                <Line yAxisId="right" type="monotone" dataKey="nombre_lots_concernes" name="Lots concernés" stroke="#3b82f6" />
              </RLineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-slate-500 mt-2 text-center italic">La contamination est un paramètre exploratoire du modèle et non un taux réel d’anomalies validé.</p>
        </div>
      </div>

      {/* Timeline Chart */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-navy-900">Timeline d’un lot signalé</h3>
          <select 
            className="text-sm border border-slate-200 rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-ice-500"
            value={selectedBatch || ''}
            onChange={(e) => setSelectedBatch(e.target.value)}
          >
            <option value="">Sélectionner un lot</option>
            {batchSummary.map((b: any) => (
              <option key={b.batch_id} value={b.batch_id}>{b.batch_id}</option>
            ))}
          </select>
        </div>
        
        {selectedBatch ? (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={timelineData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
                <XAxis dataKey="datetime" tickFormatter={(time) => new Date(time).toLocaleDateString()} minTickGap={30} />
                <YAxis />
                <RechartsTooltip labelFormatter={(label) => new Date(label).toLocaleString()} />
                <Legend />
                <Line type="stepAfter" dataKey="temperature_max" name="Température Max Horaire" stroke="#cbd5e1" strokeWidth={2} dot={false} />
                <Scatter dataKey="temperature_max" name="Profils normaux" fill="#94a3b8" />
                <Scatter 
                  data={timelineData.filter((d: any) => d.is_model_flagged)} 
                  dataKey="temperature_max" 
                  name="Profil signalé par le modèle" 
                  fill="#ef4444" 
                  r={6}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-72 flex items-center justify-center text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
            Sélectionnez un lot pour visualiser sa timeline thermique.
          </div>
        )}
      </div>

      {/* Detailed Flagged Observations Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-6">
        <div className="p-4 border-b border-slate-200">
          <h2 className="font-semibold text-navy-900">Profils horaires signalés (Détail complet)</h2>
        </div>
        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs sticky top-0 shadow-sm">
              <tr>
                <th className="px-4 py-3">Batch ID</th>
                <th className="px-4 py-3">Datetime</th>
                <th className="px-4 py-3">Étape</th>
                <th className="px-4 py-3">Environnement</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3">Temp Max</th>
                <th className="px-4 py-3">Déviation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {observations.map((obs: any, idx: number) => {
                const formattedDate = new Date(obs.datetime).toLocaleDateString('fr-FR', {
                  day: '2-digit', month: '2-digit', year: 'numeric'
                }) + ' — ' + new Date(obs.datetime).toLocaleTimeString('fr-FR', {
                  hour: '2-digit', minute: '2-digit'
                });
                return (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-4 py-2 font-medium text-navy-900">{obs.batch_id}</td>
                    <td className="px-4 py-2 text-slate-500 whitespace-nowrap">{formattedDate}</td>
                    <td className="px-4 py-2">{obs.current_hop_clean}</td>
                    <td className="px-4 py-2">{obs.external_storage_clean}</td>
                    <td className="px-4 py-2 text-red-600 font-medium">{obs.anomaly_score.toFixed(4)}</td>
                    <td className="px-4 py-2">{obs.temperature_max}°C</td>
                    <td className="px-4 py-2">{obs.absolute_deviation_from_storage_median.toFixed(1)}°C</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- Classification Tab Component ---

const ClassificationTab = ({ metrics, featureImportance, predictions, selectedModel, setSelectedModel }: any) => {
  const chartDataImportance = featureImportance
    .filter((f: any) => f.model.includes(selectedModel))
    .sort((a: any, b: any) => Math.abs(b.importance) - Math.abs(a.importance))
    .slice(0, 10);

  const hasTargetMismatch = predictions.some((p: any) => p.issue_finale_observee === "Écart explicite observé" && p.target_encoded !== 1);

  const calculateConfusionMatrix = (preds: any[], key: string) => {
    let tp = 0, tn = 0, fp = 0, fn = 0;
    preds.forEach(p => {
      if (p.target_encoded === 1 && p[key] === 1) tp++;
      if (p.target_encoded === 0 && p[key] === 0) tn++;
      if (p.target_encoded === 0 && p[key] === 1) fp++;
      if (p.target_encoded === 1 && p[key] === 0) fn++;
    });
    return { tp, tn, fp, fn };
  };

  const logRegMatrix = calculateConfusionMatrix(predictions, 'pred_logistic');
  const treeMatrix = calculateConfusionMatrix(predictions, 'pred_tree');

  const ConfusionMatrixCard = ({ title, matrix }: { title: string, matrix: any }) => (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <h3 className="font-semibold text-navy-900">{title}</h3>
      </div>
      <div className="p-5">
        <div className="grid grid-cols-3 gap-2 text-sm text-center">
          <div className="col-span-1"></div>
          <div className="col-span-1 font-semibold text-slate-600 bg-slate-100 p-2 rounded">Prédit: Livré</div>
          <div className="col-span-1 font-semibold text-slate-600 bg-slate-100 p-2 rounded">Prédit: Écart</div>
          
          <div className="col-span-1 flex items-center justify-end pr-2 font-semibold text-slate-600 text-right">Réel: Livré (0)</div>
          <div className="col-span-1 bg-green-50 text-green-700 font-bold p-3 rounded border border-green-100 flex flex-col justify-center shadow-sm">
            <span className="text-2xl">{matrix.tn}</span>
            <span className="text-[10px] uppercase tracking-wider font-normal mt-1 opacity-80">Vrais Négatifs</span>
          </div>
          <div className="col-span-1 bg-red-50 text-red-700 font-bold p-3 rounded border border-red-100 flex flex-col justify-center shadow-sm">
            <span className="text-2xl">{matrix.fp}</span>
            <span className="text-[10px] uppercase tracking-wider font-normal mt-1 opacity-80">Faux Positifs</span>
          </div>
          
          <div className="col-span-1 flex items-center justify-end pr-2 font-semibold text-slate-600 text-right">Réel: Écart (1)</div>
          <div className="col-span-1 bg-red-50 text-red-700 font-bold p-3 rounded border border-red-100 flex flex-col justify-center shadow-sm">
            <span className="text-2xl">{matrix.fn}</span>
            <span className="text-[10px] uppercase tracking-wider font-normal mt-1 opacity-80">Faux Négatifs</span>
          </div>
          <div className="col-span-1 bg-green-50 text-green-700 font-bold p-3 rounded border border-green-100 flex flex-col justify-center shadow-sm">
            <span className="text-2xl">{matrix.tp}</span>
            <span className="text-[10px] uppercase tracking-wider font-normal mt-1 opacity-80">Vrais Positifs</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Warning Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex gap-4 text-slate-300">
        <Target className="shrink-0 text-ice-500" size={24} />
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-white font-semibold text-lg">La classification exploratoire étudie les signaux associés aux issues logistiques observées.</h2>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">Exploratoire uniquement</span>
          </div>
          <p className="text-sm">Elle repose sur seulement 27 lots et ne constitue ni un modèle de décision réglementaire, ni un outil permettant d’automatiser l’écart d’un lot vaccinal.</p>
        </div>
      </div>

      {hasTargetMismatch && (
        <div className="bg-red-50 text-red-800 p-4 rounded-xl text-sm border border-red-200 flex gap-3">
          <AlertTriangle className="shrink-0 text-red-600" size={18} />
          <p>
            <strong>Incohérence de mapping de la cible détectée :</strong> L'issue "Écart explicite observé" est associée à une cible réelle inattendue dans les données de prédiction.
          </p>
        </div>
      )}

      {(!metrics || metrics.length === 0) && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 font-medium">
          Résultats non chargés — vérifier le fichier CSV d’évaluation.
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {metrics.map((m: any, idx: number) => (
          <div key={idx} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="font-semibold text-navy-900 mb-4 pb-3 border-b border-slate-100 flex flex-col gap-1">
              <span className="text-lg">{m.Model.replace(' (Scaled)', '').replace(' (max_depth=3)', '')}</span>
              <span className="text-xs text-slate-500 font-normal">Évaluation : {m.Evaluation_Method === 'LeaveOneOut' ? 'Leave-One-Out Cross-Validation' : m.Evaluation_Method}</span>
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Accuracy</p>
                <p className="text-xl font-bold text-navy-900">{(m.Accuracy * 100).toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Balanced Acc.</p>
                <p className="text-xl font-bold text-navy-900">{(m.Balanced_Accuracy * 100).toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">F1 Score</p>
                <p className="text-xl font-bold text-navy-900">{(m.F1_Score * 100).toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Precision</p>
                <p className="text-xl font-bold text-navy-900">{(m.Precision * 100).toFixed(1)}%</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Interpretation */}
      <div className="bg-white p-4 rounded-xl border-l-4 border-l-ice-500 text-sm text-slate-600 shadow-sm">
        “Lorsque l’analyse est limitée aux étapes communes précédant l’issue finale, les performances restent modestes. Cette observation renforce l’importance d’un volume de données plus important, de motifs qualité vérifiés et d’une validation externe avant toute utilisation opérationnelle.”
      </div>

      {/* Feature Importance Chart */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-navy-900">Signaux associés à l’issue logistique observée</h3>
          <select 
            className="text-sm border border-slate-200 rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-ice-500"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value as any)}
          >
            <option value="Decision Tree">Decision Tree</option>
            <option value="Logistic Regression">Logistic Regression</option>
          </select>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartDataImportance} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.5} />
              <XAxis type="number" />
              <YAxis dataKey="feature" type="category" width={150} tick={{ fontSize: 11 }} />
              <RechartsTooltip formatter={(value: any) => Number(value).toFixed(3)} />
              <Legend />
              <Bar dataKey="importance" name={selectedModel === 'Logistic Regression' ? 'Coefficient (LogReg)' : 'Importance (Tree)'} radius={[0, 4, 4, 0]}>
                {chartDataImportance.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.importance > 0 ? '#10b981' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Predictions: Confusion Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ConfusionMatrixCard title="Matrice de confusion (Logistic Regression)" matrix={logRegMatrix} />
        <ConfusionMatrixCard title="Matrice de confusion (Decision Tree)" matrix={treeMatrix} />
      </div>

    </div>
  );
};
