import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  fetchBatches, fetchKpis, fetchLotsAValider,
  fetchAnomalyScores, fetchAnomalyFlaggedObservations, fetchAnomalyBatchSummary,
  fetchAnomalyTop5Priority, fetchAnomalyKpis, fetchAnomalySensitivity,
  fetchClassificationMetrics, fetchClassificationFeatureImportance, fetchClassificationPredictions,
  validateData 
} from '../services/dataService';
import type { 
  BatchData, KpiData, LotsAValider,
  AnomalyScoreRow, AnomalyFlaggedObservation, AnomalyBatchSummary,
  AnomalyKpi, AnomalySensitivityRow, ClassificationMetric,
  ClassificationFeatureImportance, ClassificationPrediction
} from '../services/dataService';

interface DataContextType {
  batches: BatchData[];
  kpis: KpiData[];
  lotsAValider: LotsAValider[];
  anomalyScores: AnomalyScoreRow[];
  anomalyFlaggedObservations: AnomalyFlaggedObservation[];
  anomalyBatchSummary: AnomalyBatchSummary[];
  anomalyTop5Priority: AnomalyBatchSummary[];
  anomalyKpis: AnomalyKpi[];
  anomalySensitivity: AnomalySensitivityRow[];
  classificationMetrics: ClassificationMetric[];
  classificationFeatureImportance: ClassificationFeatureImportance[];
  classificationPredictions: ClassificationPrediction[];
  loading: boolean;
  error: string | null;
  isValid: boolean;
  analyticalDataAvailable: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [batches, setBatches] = useState<BatchData[]>([]);
  const [kpis, setKpis] = useState<KpiData[]>([]);
  const [lotsAValider, setLotsAValider] = useState<LotsAValider[]>([]);
  
  // Analytical State
  const [anomalyScores, setAnomalyScores] = useState<AnomalyScoreRow[]>([]);
  const [anomalyFlaggedObservations, setAnomalyFlaggedObservations] = useState<AnomalyFlaggedObservation[]>([]);
  const [anomalyBatchSummary, setAnomalyBatchSummary] = useState<AnomalyBatchSummary[]>([]);
  const [anomalyTop5Priority, setAnomalyTop5Priority] = useState<AnomalyBatchSummary[]>([]);
  const [anomalyKpis, setAnomalyKpis] = useState<AnomalyKpi[]>([]);
  const [anomalySensitivity, setAnomalySensitivity] = useState<AnomalySensitivityRow[]>([]);
  const [classificationMetrics, setClassificationMetrics] = useState<ClassificationMetric[]>([]);
  const [classificationFeatureImportance, setClassificationFeatureImportance] = useState<ClassificationFeatureImportance[]>([]);
  const [classificationPredictions, setClassificationPredictions] = useState<ClassificationPrediction[]>([]);
  const [analyticalDataAvailable, setAnalyticalDataAvailable] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Core Descriptive Data
        const [batchesData, kpisData, lotsData] = await Promise.all([
          fetchBatches(),
          fetchKpis(),
          fetchLotsAValider().catch(() => []) // Fallback if doesn't exist
        ]);
        
        setBatches(batchesData);
        setKpis(kpisData);
        setLotsAValider(lotsData);
        setIsValid(validateData(batchesData));

        // Analytical Data
        try {
          const [
            scores, flaggedObs, batchSummary, top5, aKpis,
            sensitivity, metrics, importance, predictions
          ] = await Promise.all([
            fetchAnomalyScores(),
            fetchAnomalyFlaggedObservations(),
            fetchAnomalyBatchSummary(),
            fetchAnomalyTop5Priority(),
            fetchAnomalyKpis(),
            fetchAnomalySensitivity(),
            fetchClassificationMetrics(),
            fetchClassificationFeatureImportance(),
            fetchClassificationPredictions()
          ]);

          setAnomalyScores(scores);
          setAnomalyFlaggedObservations(flaggedObs);
          setAnomalyBatchSummary(batchSummary);
          setAnomalyTop5Priority(top5);
          setAnomalyKpis(aKpis);
          setAnomalySensitivity(sensitivity);
          setClassificationMetrics(metrics);
          setClassificationFeatureImportance(importance);
          setClassificationPredictions(predictions);
          setAnalyticalDataAvailable(true);
        } catch (analyticalErr) {
          console.warn("Analytical data not fully available:", analyticalErr);
          setAnalyticalDataAvailable(false);
        }

        setLoading(false);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('Failed to load CSV data. Please ensure the files are placed in the public/data/ directory.');
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <DataContext.Provider value={{ 
      batches, kpis, lotsAValider,
      anomalyScores, anomalyFlaggedObservations, anomalyBatchSummary,
      anomalyTop5Priority, anomalyKpis, anomalySensitivity,
      classificationMetrics, classificationFeatureImportance, classificationPredictions,
      loading, error, isValid, analyticalDataAvailable
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
