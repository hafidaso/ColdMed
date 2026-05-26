import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Truck, Plane, Building2, ShieldAlert, Package, CheckCircle } from 'lucide-react';

export const LogisticsTraceability: React.FC = () => {
  const { batches, loading, error } = useData();
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-900"></div></div>;
  if (error) return <div className="p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>;

  const selectedBatch = batches.find(b => b.batch_id === selectedBatchId) || batches[0];

  if (!selectedBatch) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Traçabilité logistique</h1>
        <p className="text-sm text-slate-500 mt-1">Suivi du parcours logistique (illustratif) et points de rupture de la chaîne du froid.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-4 w-full md:w-auto mb-4 md:mb-0">
            <label className="text-sm font-bold text-navy-900 uppercase tracking-wider">Sélectionner un lot :</label>
            <select 
              className="py-2 px-4 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-ice-500 outline-none font-medium"
              value={selectedBatch.batch_id}
              onChange={(e) => setSelectedBatchId(e.target.value)}
            >
              {batches.map(b => (
                <option key={b.batch_id} value={b.batch_id}>{b.batch_id}</option>
              ))}
            </select>
          </div>
          <div className="text-right w-full md:w-auto">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Issue du parcours</p>
            <p className="text-lg font-bold text-navy-900">{selectedBatch.issue_finale_observee}</p>
          </div>
        </div>

        <h3 className="font-bold text-navy-900 mb-2 px-8 flex items-center gap-2">
          Parcours logistique illustratif
        </h3>
        <p className="text-xs text-slate-500 px-8 mb-4">
          Ce diagramme représente un modèle standard de flux de distribution et la position estimée de l'issue finale.
        </p>

        <div className="relative pt-4 pb-12 overflow-x-auto">
          <div className="flex items-center min-w-[800px] justify-between px-8 relative">
            {/* Connecting Line */}
            <div className="absolute top-1/2 left-16 right-16 h-1 bg-slate-200 -translate-y-1/2 z-0"></div>
            
            <StepperNode 
              icon={Building2} 
              label="Source Hub" 
              active={true}
              stage="source_hub"
            />
            <StepperNode 
              icon={Plane} 
              label="Air Cargo (Origine)" 
              active={true}
              stage="source_air_cargo"
            />
            <StepperNode 
              icon={Plane} 
              label="Air Transit" 
              active={true}
              stage="air_transit"
            />
            <StepperNode 
              icon={Building2} 
              label="Air Cargo (Dest.)" 
              active={true}
              stage="dest_air_cargo"
            />
            <StepperNode 
              icon={Truck} 
              label="Transport Frigo" 
              active={true}
              stage="dest_reefer_truck"
            />
            <StepperNode 
              icon={Building2} 
              label="Unité de stockage de destination" 
              active={true}
              stage="dest_vaccine_storage_unit"
            />
            
            {selectedBatch.issue_finale_observee === "Livré au site de vaccination" ? (
              <>
                <StepperNode 
                  icon={Truck} 
                  label="Dernier Kilomètre" 
                  active={true}
                  stage="last_mile"
                />
                <StepperNode 
                  icon={CheckCircle} 
                  label="Site de Vaccination" 
                  active={true}
                  stage="immunization_site"
                  color="emerald"
                />
              </>
            ) : (
              <StepperNode 
                icon={ShieldAlert} 
                label="Destination d’écart observée" 
                active={true}
                stage="dest_discarded_vaccine_storage_unit"
                color="red"
              />
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-bold text-navy-900 mb-4 border-b pb-2 flex items-center gap-2">
            <Package size={18} className="text-slate-400" /> Détails du stockage final observé
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Localisation géographique</p>
              <p className="font-medium text-navy-900">{selectedBatch.localisation_finale}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Étape du flux (Hop)</p>
              <p className="font-medium text-navy-900">{selectedBatch.etape_finale}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Type d'équipement de stockage</p>
              <p className="font-medium text-navy-900">{selectedBatch.stockage_final}</p>
            </div>
            
            {selectedBatch.issue_finale_observee === "Discordance à valider" && (
              <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-800 flex gap-2 items-start">
                <ShieldAlert size={16} className="mt-0.5 shrink-0" />
                <p><strong>Alerte logique :</strong> L'équipement "{selectedBatch.stockage_final}" ne correspond pas logiquement à l'étape "{selectedBatch.etape_finale}". Une validation humaine est requise.</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-ice-50 border border-ice-100 rounded-xl p-5 shadow-sm">
          <h3 className="font-bold text-ice-900 mb-4 border-b border-ice-200 pb-2">Information de contexte</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Le parcours ci-dessus illustre les étapes standards (source_hub → air_transit → destination → site de vaccination).
            Dans le cas des lots associés à un écart explicite observé, la chaîne s'interrompt souvent au niveau du hub aéroportuaire ou du stockage central, avec un transfert vers une unité de stockage pour vaccins écartés.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed mt-4">
            <em>Note : Ce rendu est un <strong>Parcours logistique illustratif</strong> basé sur le modèle standard de distribution. Aucun rendu cartographique local n'est affiché car le dataset actuel est international.</em>
          </p>
        </div>
      </div>
    </div>
  );
};

interface StepperNodeProps {
  icon: React.ElementType;
  label: string;
  active: boolean;
  stage: string;
  color?: 'navy' | 'emerald' | 'red';
}

const StepperNode: React.FC<StepperNodeProps> = ({ icon: Icon, label, active, color = 'navy' }) => {
  const colorClasses = {
    navy: 'bg-navy-900 text-white ring-white',
    emerald: 'bg-emerald-500 text-white ring-white',
    red: 'bg-red-500 text-white ring-white'
  };
  const textClasses = {
    navy: 'text-navy-900',
    emerald: 'text-emerald-700 font-bold',
    red: 'text-red-700 font-bold'
  };

  return (
    <div className="flex flex-col items-center z-10 w-32 relative">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ring-4 ${active ? colorClasses[color] : 'bg-slate-200 text-slate-400 ring-white'}`}>
        <Icon size={20} />
      </div>
      <p className={`text-xs text-center mt-3 leading-tight ${active ? textClasses[color] : 'text-slate-400'}`}>
        {label}
      </p>
    </div>
  );
};
