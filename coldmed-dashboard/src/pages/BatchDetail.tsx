import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { 
  ArrowLeft, Calendar, MapPin, Thermometer, Info,
  AlertTriangle, ShieldAlert, CheckCircle, Clock, XOctagon, BrainCircuit
} from 'lucide-react';

export const BatchDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { batches, anomalyBatchSummary, loading, error } = useData();

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-900"></div></div>;
  if (error) return <div className="p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>;

  const batch = batches.find(b => b.batch_id === id);

  if (!batch) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-navy-900">Lot introuvable</h2>
        <button onClick={() => navigate('/surveillance')} className="mt-4 text-ice-600 hover:underline">
          Retour à la surveillance
        </button>
      </div>
    );
  }

  const isDiscordant = batch.issue_finale_observee === "Discordance à valider";
  const anomalyInfo = anomalyBatchSummary?.find((a: any) => a.batch_id === id);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-2">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
          <ArrowLeft size={20} className="text-navy-900" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Lot {batch.batch_id}</h1>
          <p className="text-sm text-slate-500">Fiche détaillée du parcours vaccinal</p>
        </div>
        <div className="ml-auto flex gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-800">
            {batch.issue_finale_observee}
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border border-slate-300">
            {batch.niveau_revue_qualite}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-navy-900 mb-4 border-b pb-2 flex items-center gap-2">
              <Calendar size={18} className="text-slate-400" /> Résumé du parcours
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Première mesure</p>
                <p className="font-medium text-navy-900">{batch.premiere_mesure}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Dernière mesure</p>
                <p className="font-medium text-navy-900">{batch.derniere_mesure}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Nombre de mesures</p>
                <p className="font-medium text-navy-900">{batch.nombre_mesures} enregistrements</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Localisations</p>
                <p className="font-medium text-navy-900">{batch.nombre_localisations} étapes</p>
              </div>
              <div className="col-span-2 mt-2">
                <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Localisation finale</p>
                <p className="font-medium text-navy-900 flex items-center gap-2">
                  <MapPin size={16} className="text-ice-500" /> {batch.localisation_finale}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-navy-900 mb-4 border-b pb-2 flex items-center gap-2">
              <Thermometer size={18} className="text-slate-400" /> Indicateurs thermiques
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-slate-50 p-3 rounded-lg text-center">
                <p className="text-xs text-slate-500 mb-1">T. Minimale</p>
                <p className="text-xl font-bold text-navy-900">{batch.temperature_min}°C</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg text-center">
                <p className="text-xs text-slate-500 mb-1">T. Maximale</p>
                <p className={`text-xl font-bold ${batch.temperature_max > 8 ? 'text-red-600' : 'text-navy-900'}`}>
                  {batch.temperature_max}°C
                </p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg text-center">
                <p className="text-xs text-slate-500 mb-1">T. Finale Min</p>
                <p className="text-xl font-bold text-navy-900">{batch.temperature_finale_min}°C</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg text-center">
                <p className="text-xs text-slate-500 mb-1">T. Finale Max</p>
                <p className={`text-xl font-bold ${batch.temperature_finale_max > 8 ? 'text-red-600' : 'text-navy-900'}`}>
                  {batch.temperature_finale_max}°C
                </p>
              </div>
            </div>

            {batch.temperature_finale_min !== batch.temperature_finale_max && (
              <div className="bg-ice-50 border-l-4 border-ice-500 p-3 mb-6 rounded-r-lg flex gap-3 items-start">
                <Info size={16} className="text-ice-600 mt-0.5 shrink-0" />
                <p className="text-sm text-ice-900">
                  <span className="font-semibold">Plusieurs lectures observées à la dernière heure.</span> La température maximale est retenue comme signal de vigilance.
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">Heures hors limite (&gt; 8°C)</span>
                  <span className="font-bold text-red-600">{batch.heures_hors_limite_max} h</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: `${Math.min(100, (batch.heures_hors_limite_max / 10) * 100)}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">Heures en réfrigération (2-8°C)</span>
                  <span className="font-bold text-emerald-600">{batch.heures_refrigeration_max} h</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${Math.min(100, (batch.heures_refrigeration_max / 200) * 100)}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">Heures en ultra-basse température (-70°C)</span>
                  <span className="font-bold text-blue-600">{batch.heures_ultra_low_max} h</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min(100, (batch.heures_ultra_low_max / 200) * 100)}%` }}></div>
                </div>
              </div>
            </div>
          </div>
          
          {anomalyInfo && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 shadow-sm">
              <h3 className="font-bold text-amber-900 mb-4 border-b border-amber-200 pb-2 flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <BrainCircuit size={18} className="text-amber-600" /> Profils thermiques signalés
                </span>
                {anomalyInfo.is_top_5_priority && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-800 uppercase tracking-wider">
                    Top 5 Priorité
                  </span>
                )}
              </h3>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-white p-3 rounded-lg border border-amber-100 text-center">
                  <p className="text-xs text-amber-700 mb-1">Profils signalés</p>
                  <p className="text-xl font-bold text-amber-900">{anomalyInfo.nombre_profils_signales}</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-amber-100 text-center">
                  <p className="text-xs text-amber-700 mb-1">Score Max</p>
                  <p className="text-xl font-bold text-amber-900">{anomalyInfo.anomaly_score_max.toFixed(3)}</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-amber-100 text-center">
                  <p className="text-xs text-amber-700 mb-1">Temp. Max</p>
                  <p className="text-xl font-bold text-amber-900">{anomalyInfo.temperature_max_signalee}°C</p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-amber-700 italic flex-1">
                  Signal analytique à examiner — ne constitue pas une cause officielle d’écart.
                </p>
                <button 
                  onClick={() => navigate('/intelligence-analytique')}
                  className="text-sm font-medium bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition-colors ml-4 shrink-0"
                >
                  Voir l'analyse détaillée
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-navy-900 mb-4 border-b pb-2 flex items-center gap-2">
              <AlertTriangle size={18} className="text-slate-400" /> Signaux détectés
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                {batch.signal_temperature_superieure_8 ? <XOctagon size={18} className="text-red-500" /> : <CheckCircle size={18} className="text-emerald-500" />}
                <span className="text-sm">Température &gt; 8°C observée</span>
              </li>
              <li className="flex items-start gap-3">
                {batch.signal_excursion_prolongee ? <AlertTriangle size={18} className="text-orange-500" /> : <CheckCircle size={18} className="text-emerald-500" />}
                <span className="text-sm">Excursion thermique prolongée</span>
              </li>
              <li className="flex items-start gap-3">
                {batch.signal_expiration ? <Clock size={18} className="text-red-500" /> : <CheckCircle size={18} className="text-emerald-500" />}
                <span className="text-sm">Expiration détectée (durée de vie)</span>
              </li>
              <li className="flex items-start gap-3">
                {isDiscordant ? <AlertTriangle size={18} className="text-red-500" /> : <CheckCircle size={18} className="text-emerald-500" />}
                <span className="text-sm">Discordance de l'état final</span>
              </li>
            </ul>
            <div className="mt-4 p-3 bg-slate-50 border border-slate-100 rounded text-xs text-slate-500">
              <p>Seuil descriptif de vigilance : <strong>8°C</strong> pour les phases réfrigérées.</p>
            </div>
          </div>

          <div className="bg-navy-900 border border-navy-800 rounded-xl p-5 shadow-sm text-white">
            <h3 className="font-bold mb-4 border-b border-navy-700 pb-2 flex items-center gap-2">
              <ShieldAlert size={18} className="text-ice-400" /> Formulaire de revue (Mockup)
            </h3>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Décision qualité</label>
                <select className="w-full py-2 px-3 bg-navy-800 border border-navy-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-ice-500 outline-none">
                  <option>À examiner</option>
                  <option>Maintenir en observation</option>
                  <option>Écarter</option>
                  <option>Valider pour livraison</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Commentaire obligatoire</label>
                <textarea 
                  rows={3} 
                  className="w-full py-2 px-3 bg-navy-800 border border-navy-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-ice-500 outline-none resize-none"
                  placeholder="Justification de la décision..."
                ></textarea>
              </div>
              <button className="w-full bg-ice-500 hover:bg-ice-600 text-white py-2 rounded-lg text-sm font-medium transition-colors">
                Enregistrer la décision
              </button>
            </form>
            <p className="text-[10px] text-slate-400 mt-4 text-center">
              Prototype UI uniquement. Ne modifie pas le dataset d'origine.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
