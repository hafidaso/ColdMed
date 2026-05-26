import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, AlertTriangle, CheckCircle, ArrowRight, BrainCircuit } from 'lucide-react';
import type { BatchData } from '../services/dataService';

const HUMAN_LABELS: Record<string, string> = {
  "dest_vaccine_storage_unit": "Unité de stockage vaccinale",
  "dest_discarded_vaccine_storage_unit": "Destination d’écart observée",
  "discarded_vaccine_storage_unit": "Stockage des vaccins écartés",
  "immunization_site": "Site de vaccination",
  "source_hub": "Hub aéroportuaire",
  "air_transit": "Transit aérien",
  "regional_storage": "Stockage régional"
};

const formatLocation = (loc: string) => HUMAN_LABELS[loc] || loc;

type FilterType = 'ALL' | 'DISCORDANCE' | 'EXPIRATION' | 'EXCURSION' | 'SIGNAL_IA';

export const QualityReview: React.FC = () => {
  const { batches, anomalyBatchSummary, loading, error } = useData();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterType>('ALL');

  const queue = useMemo(() => {
    let result = [...batches].filter(b => b.niveau_revue_qualite !== 'Aucun signal identifié');
    
    // Sort logic
    const severityOrder: Record<string, number> = {
      "Priorité critique - discordance à valider": 1,
      "Priorité critique - expiration observée": 2,
      "Priorité élevée - excursion thermique prolongée": 3,
      "Surveillance - signal thermique enregistré": 4
    };
    
    result.sort((a, b) => {
      const orderA = severityOrder[a.niveau_revue_qualite] || 99;
      const orderB = severityOrder[b.niveau_revue_qualite] || 99;
      if (orderA !== orderB) return orderA - orderB;
      return b.temperature_max - a.temperature_max;
    });

    if (filter === 'DISCORDANCE') {
      result = result.filter(b => b.issue_finale_observee === 'Discordance à valider' || b.niveau_revue_qualite.includes('discordance'));
    } else if (filter === 'EXPIRATION') {
      result = result.filter(b => b.signal_expiration);
    } else if (filter === 'EXCURSION') {
      result = result.filter(b => b.signal_excursion_prolongee);
    } else if (filter === 'SIGNAL_IA') {
      result = result.filter(b => anomalyBatchSummary?.some((a: any) => a.batch_id === b.batch_id));
    }

    return result;
  }, [batches, filter, anomalyBatchSummary]);

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-900"></div></div>;
  if (error) return <div className="p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>;

  const renderBatchCard = (batch: BatchData) => (
    <div key={batch.batch_id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-bold text-navy-900 text-lg">{batch.batch_id}</h4>
            {anomalyBatchSummary?.some((a: any) => a.batch_id === batch.batch_id) && (
              <span 
                className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 cursor-help" 
                title="Profil signalé par Isolation Forest à des fins exploratoires. Ne constitue pas une décision qualité."
              >
                <BrainCircuit size={10} /> Signal analytique
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 uppercase tracking-wider">{batch.niveau_revue_qualite}</p>
        </div>
        <button 
          onClick={() => navigate(`/lot/${batch.batch_id}`)}
          className="text-xs bg-navy-900 text-white px-3 py-1.5 rounded-lg hover:bg-navy-800 transition-colors font-medium shrink-0"
        >
          Examiner
        </button>
      </div>

      <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm mb-4">
        <div>
          <span className="text-slate-500 text-xs">Étape finale</span>
          <p className="font-medium text-navy-900 cursor-help border-b border-dashed border-slate-300 inline-block" title={batch.etape_finale}>
            {formatLocation(batch.etape_finale)}
          </p>
        </div>
        <div>
          <span className="text-slate-500 text-xs">Stockage final</span>
          <p className="font-medium text-navy-900 cursor-help border-b border-dashed border-slate-300 inline-block" title={batch.stockage_final}>
            {formatLocation(batch.stockage_final)}
          </p>
        </div>
        <div>
          <span className="text-slate-500 text-xs">T. Max observée</span>
          <p className={`font-medium ${batch.temperature_max > 8 ? 'text-red-600' : 'text-navy-900'}`}>{batch.temperature_max}°C</p>
        </div>
        <div>
          <span className="text-slate-500 text-xs">Heures hors limite</span>
          <p className={`font-medium ${batch.heures_hors_limite_max >= 5 ? 'text-orange-600' : 'text-navy-900'}`}>{batch.heures_hors_limite_max} h</p>
        </div>
      </div>

      {batch.niveau_revue_qualite.includes('discordance') && (
        <div className="bg-red-50 text-red-800 p-3 rounded-lg text-sm flex gap-3">
          <AlertTriangle className="shrink-0 text-red-600" size={18} />
          <p>
            <strong>Signal :</strong> Le stockage final est associé aux vaccins écartés, alors que l'étape finale ne mentionne pas explicitement une destination de rejet.
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Revue qualité</h1>
        <p className="text-sm text-slate-500 mt-1">File de revue prioritaire des lots nécessitant une validation humaine.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-navy-900 mb-4 flex items-center gap-2">
          <ShieldAlert className="text-slate-400" /> Workflow de validation (Mockup)
        </h2>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm font-medium">
          <div className="flex-1 w-full bg-slate-100 p-4 rounded-lg text-center text-slate-500 border border-slate-200">
            En attente de revue
          </div>
          <ArrowRight className="text-slate-300 hidden md:block" />
          <div className="flex-1 w-full bg-ice-50 p-4 rounded-lg text-center text-ice-700 border border-ice-200">
            En cours d'analyse
          </div>
          <ArrowRight className="text-slate-300 hidden md:block" />
          <div className="flex-1 w-full bg-orange-50 p-4 rounded-lg text-center text-orange-700 border border-orange-200">
            Décision documentée
          </div>
          <ArrowRight className="text-slate-300 hidden md:block" />
          <div className="flex-1 w-full bg-emerald-50 p-4 rounded-lg text-center text-emerald-700 border border-emerald-200 flex items-center justify-center gap-2">
            <CheckCircle size={16} /> Rapport généré
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-navy-900 mb-4 flex items-center gap-2 mt-8">
          File de revue prioritaire
        </h2>
        
        <div className="flex flex-wrap gap-2 mb-6">
          <button 
            onClick={() => setFilter('ALL')} 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'ALL' ? 'bg-navy-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            Tous
          </button>
          <button 
            onClick={() => setFilter('DISCORDANCE')} 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'DISCORDANCE' ? 'bg-navy-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            Discordances
          </button>
          <button 
            onClick={() => setFilter('EXPIRATION')} 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'EXPIRATION' ? 'bg-navy-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            Expirations
          </button>
          <button 
            onClick={() => setFilter('EXCURSION')} 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'EXCURSION' ? 'bg-navy-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            Excursions prolongées
          </button>
          <button 
            onClick={() => setFilter('SIGNAL_IA')} 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'SIGNAL_IA' ? 'bg-navy-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            Profils signalés par le modèle
          </button>
        </div>

        {queue.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {queue.map(b => renderBatchCard(b))}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500">
            Aucun lot ne correspond à ce critère dans la file prioritaire.
          </div>
        )}
      </div>
    </div>
  );
};
