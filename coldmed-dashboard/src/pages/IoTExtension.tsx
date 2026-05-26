import React from 'react';
import { Cpu, Wifi, Database, LayoutDashboard, ArrowRight, Activity, Battery, MapPin, DoorOpen, ThermometerSun, BrainCircuit } from 'lucide-react';

export const IoTExtension: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Extension IoT & Temps Réel</h1>
        <p className="text-sm text-slate-500 mt-1">Architecture cible pour le déploiement opérationnel.</p>
      </div>

      <div className="bg-gradient-to-r from-ice-500 to-navy-900 rounded-xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-lg font-bold mb-2">Phase 2 : Intégration IoT</h2>
          <p className="text-ice-100 text-sm max-w-2xl leading-relaxed">
            L'intégration IoT remplacera ou complétera la source CSV par des mesures en temps réel,
            sans modifier la logique principale d'analyse thermique et de revue qualité du dashboard actuel.
          </p>
        </div>
        <div className="absolute -right-10 -top-10 opacity-10">
          <Wifi size={200} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-navy-900 mb-6 pb-2 border-b border-slate-100">Architecture technique cible</h3>

          <div className="flex flex-col items-center gap-2">
            <ArchitectureNode
              icon={Cpu}
              title="ESP32 + Capteurs"
              subtitle="Acquisition matérielle (Température, Porte, Batterie)"
              color="bg-slate-800"
            />
            <ArrowRight className="text-slate-300 rotate-90 my-1" size={24} />

            <ArchitectureNode
              icon={Wifi}
              title="Transmission télémétrique MQTT"
              subtitle="Sécurisation prévue : TLS et authentification"
              color="bg-ice-500"
            />
            <ArrowRight className="text-slate-300 rotate-90 my-1" size={24} />

            <ArchitectureNode
              icon={Database}
              title="N8N & Base de données"
              subtitle="Traitement, normalisation et stockage"
              color="bg-indigo-500"
            />
            <ArrowRight className="text-slate-300 rotate-90 my-1" size={24} />

            <ArchitectureNode
              icon={BrainCircuit}
              title="Module Analytique (Python/AI)"
              subtitle="Détection d'atypicité et prédiction"
              color="bg-amber-500"
            />
            <ArrowRight className="text-slate-300 rotate-90 my-1" size={24} />

            <ArchitectureNode
              icon={LayoutDashboard}
              title="Dashboard & Revue Qualité"
              subtitle="Interface de supervision ColdMed Trace"
              color="bg-navy-900"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-navy-900 mb-4 pb-2 border-b border-slate-100">Statut du déploiement</h3>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-lg border border-emerald-200 bg-emerald-50">
                <div className="bg-emerald-100 p-2 rounded-full text-emerald-600 shrink-0">
                  <CheckCircle size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-emerald-800 text-sm">Version actuelle (Phase 1)</h4>
                  <p className="text-xs text-emerald-700 mt-1">Analyse CSV / données historiques internationales. Validation de la logique métier et de l'interface.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg border border-ice-200 bg-ice-50">
                <div className="bg-ice-100 p-2 rounded-full text-ice-600 shrink-0">
                  <Activity size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-ice-800 text-sm">Phase future (Phase 2)</h4>
                  <p className="text-xs text-ice-700 mt-1">Flux temps réel par capteurs IoT déployés localement.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg border border-amber-200 bg-amber-50">
                <div className="bg-amber-100 p-2 rounded-full text-amber-600 shrink-0">
                  <BrainCircuit size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-amber-800 text-sm">Vision : Intelligence Analytique temps réel</h4>
                  <p className="text-xs text-amber-700 mt-1">L'intégration IoT permettra d'alimenter les algorithmes de détection d'atypicité thermique en continu pour générer des signaux préventifs avant l'arrivée au site final.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-navy-900 mb-4 pb-2 border-b border-slate-100">Capteurs prévus (Hardware)</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                <ThermometerSun className="text-red-500" size={20} />
                <span className="text-sm font-medium text-slate-700">Sonde de Température</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                <DoorOpen className="text-orange-500" size={20} />
                <span className="text-sm font-medium text-slate-700">Statut d'Ouverture (Porte)</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                <Battery className="text-emerald-500" size={20} />
                <span className="text-sm font-medium text-slate-700">Niveau de Batterie</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                <MapPin className="text-blue-500" size={20} />
                <span className="text-sm font-medium text-slate-700">Position GPS (optionnel)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CheckCircle = ({ size }: { size: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

const ArchitectureNode = ({ icon: Icon, title, subtitle, color }: any) => (
  <div className="w-full max-w-md border border-slate-200 rounded-lg p-4 flex items-center gap-4 bg-slate-50 shadow-sm">
    <div className={`p-3 rounded-lg text-white ${color}`}>
      <Icon size={24} />
    </div>
    <div>
      <h4 className="font-bold text-navy-900">{title}</h4>
      <p className="text-xs text-slate-500">{subtitle}</p>
    </div>
  </div>
);
