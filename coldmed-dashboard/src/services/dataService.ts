import Papa from 'papaparse';

export interface BatchData {
  batch_id: string;
  premiere_mesure: string;
  derniere_mesure: string;
  nombre_mesures: number;
  nombre_localisations: number;
  temperature_min: number;
  temperature_max: number;
  temperature_moyenne: number;
  humidite_moyenne: number;
  heures_hors_limite_max: number;
  heures_refrigeration_max: number;
  heures_ultra_low_max: number;
  expiration_min: number;
  presence_discarded: boolean;
  statut_analytique: string;
  date_fin_observee: string;
  localisation_finale: string;
  etape_finale: string;
  stockage_final: string;
  temperature_finale_min: number;
  temperature_finale_max: number;
  temperature_finale_moyenne: number;
  expiration_heures_finale: number;
  heures_hors_limite_finales: number;
  issue_finale_observee: string;
  signal_temperature_superieure_8: boolean;
  signal_excursion_prolongee: boolean;
  signal_expiration: boolean;
  signal_temperature_finale_superieure_8: boolean;
  niveau_revue_qualite: string;
}

export interface KpiData {
  KPI: string;
  Valeur: number;
}

export interface LotsAValider {
  batch_id: string;
  date_fin_observee: string;
  localisation_finale: string;
  etape_finale: string;
  stockage_final: string;
  temperature_max: number;
  temperature_finale_min: number;
  temperature_finale_max: number;
  heures_hors_limite_max: number;
  expiration_min: number;
  niveau_revue_qualite: string;
}

// --- Analytical Data Interfaces ---

export interface AnomalyScoreRow {
  batch_id: string;
  datetime: string;
  location: string;
  current_hop_clean: string;
  external_storage_clean: string;
  temperature_min: number;
  temperature_max: number;
  temperature_moyenne: number;
  temperature_range: number;
  deviation_from_storage_median: number;
  absolute_deviation_from_storage_median: number;
  temperature_change_from_previous_hour: number;
  iso_forest_pred: number;
  anomaly_score: number;
  is_model_flagged?: boolean;
}

export interface AnomalyFlaggedObservation extends AnomalyScoreRow {
  // Essentially the same structure but specifically flagged
}

export interface AnomalyBatchSummary {
  batch_id: string;
  nombre_profils_signales: number;
  anomaly_score_max: number;
  temperature_max_signalee: number;
  deviation_contextuelle_max: number;
  premiere_observation_signalee: string;
  derniere_observation_signalee: string;
  issue_finale_observee: string;
  niveau_revue_qualite: string;
  rang_priorite?: number;
  is_top_5_priority?: boolean;
}

export interface AnomalyKpi {
  KPI: string;
  Valeur: number;
}

export interface AnomalySensitivityRow {
  contamination: number;
  nombre_profils_signales: number;
  nombre_lots_concernes: number;
}

export interface ClassificationMetric {
  Model: string;
  Accuracy: number;
  Balanced_Accuracy: number;
  Precision: number;
  Recall: number;
  F1_Score: number;
  Evaluation_Method: string;
}

export interface ClassificationFeatureImportance {
  feature: string;
  importance: number;
  model: string;
}

export interface ClassificationPrediction {
  batch_id: string;
  issue_finale_observee: string;
  target_encoded: number;
  pred_logistic: number;
  pred_tree: number;
}

// --- Parsers ---

const parseBoolean = (val: string): boolean => {
  if (!val) return false;
  return val.toLowerCase() === 'true' || val === '1';
};

const parseNumber = (val: string): number => {
  if (!val) return 0;
  const parsed = parseFloat(val);
  return isNaN(parsed) ? 0 : parsed;
};

// --- Generic CSV Fetcher ---

const fetchCsvData = <T>(url: string, rowMapper: (row: any) => T): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    fetch(url)
      .then(res => {
        if (!res.ok) {
          throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
        }
        return res.text();
      })
      .then(text => {
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const data: T[] = results.data.map(rowMapper);
            resolve(data);
          },
          error: (error: any) => reject(error)
        });
      })
      .catch(err => reject(err));
  });
};

// --- Existing Fetchers ---

export const fetchBatches = (): Promise<BatchData[]> => {
  return fetchCsvData('/data/coldmed_batch_dashboard_corrige.csv', (row: any) => ({
    ...row,
    nombre_mesures: parseNumber(row.nombre_mesures),
    nombre_localisations: parseNumber(row.nombre_localisations),
    temperature_min: parseNumber(row.temperature_min),
    temperature_max: parseNumber(row.temperature_max),
    temperature_moyenne: parseNumber(row.temperature_moyenne),
    humidite_moyenne: parseNumber(row.humidite_moyenne),
    heures_hors_limite_max: parseNumber(row.heures_hors_limite_max),
    heures_refrigeration_max: parseNumber(row.heures_refrigeration_max),
    heures_ultra_low_max: parseNumber(row.heures_ultra_low_max),
    expiration_min: parseNumber(row.expiration_min),
    presence_discarded: parseBoolean(row.presence_discarded),
    temperature_finale_min: parseNumber(row.temperature_finale_min),
    temperature_finale_max: parseNumber(row.temperature_finale_max),
    temperature_finale_moyenne: parseNumber(row.temperature_finale_moyenne),
    expiration_heures_finale: parseNumber(row.expiration_heures_finale),
    heures_hors_limite_finales: parseNumber(row.heures_hors_limite_finales),
    signal_temperature_superieure_8: parseBoolean(row.signal_temperature_superieure_8),
    signal_excursion_prolongee: parseBoolean(row.signal_excursion_prolongee),
    signal_expiration: parseBoolean(row.signal_expiration),
    signal_temperature_finale_superieure_8: parseBoolean(row.signal_temperature_finale_superieure_8)
  }));
};

export const fetchKpis = (): Promise<KpiData[]> => {
  return fetchCsvData('/data/coldmed_kpis_dashboard_corrige.csv', (row: any) => ({
    KPI: row.KPI,
    Valeur: parseNumber(row.Valeur)
  }));
};

export const fetchLotsAValider = (): Promise<LotsAValider[]> => {
  return fetchCsvData('/data/coldmed_lots_a_valider.csv', (row: any) => ({
    ...row,
    temperature_max: parseNumber(row.temperature_max),
    temperature_finale_min: parseNumber(row.temperature_finale_min),
    temperature_finale_max: parseNumber(row.temperature_finale_max),
    heures_hors_limite_max: parseNumber(row.heures_hors_limite_max),
    expiration_min: parseNumber(row.expiration_min)
  }));
};

// --- New Analytical Fetchers ---

export const fetchAnomalyScores = (): Promise<AnomalyScoreRow[]> => {
  return fetchCsvData('/data/coldmed_anomaly_scores.csv', (row: any) => ({
    ...row,
    temperature_min: parseNumber(row.temperature_min),
    temperature_max: parseNumber(row.temperature_max),
    temperature_moyenne: parseNumber(row.temperature_moyenne),
    temperature_range: parseNumber(row.temperature_range),
    deviation_from_storage_median: parseNumber(row.deviation_from_storage_median),
    absolute_deviation_from_storage_median: parseNumber(row.absolute_deviation_from_storage_median),
    temperature_change_from_previous_hour: parseNumber(row.temperature_change_from_previous_hour),
    iso_forest_pred: parseNumber(row.iso_forest_pred),
    anomaly_score: parseNumber(row.anomaly_score),
    is_model_flagged: parseBoolean(row.is_model_flagged)
  }));
};

export const fetchAnomalyFlaggedObservations = (): Promise<AnomalyFlaggedObservation[]> => {
  return fetchCsvData('/data/coldmed_anomaly_flagged_observations.csv', (row: any) => ({
    ...row,
    temperature_min: parseNumber(row.temperature_min),
    temperature_max: parseNumber(row.temperature_max),
    temperature_moyenne: parseNumber(row.temperature_moyenne),
    temperature_range: parseNumber(row.temperature_range),
    deviation_from_storage_median: parseNumber(row.deviation_from_storage_median),
    absolute_deviation_from_storage_median: parseNumber(row.absolute_deviation_from_storage_median),
    temperature_change_from_previous_hour: parseNumber(row.temperature_change_from_previous_hour),
    iso_forest_pred: parseNumber(row.iso_forest_pred),
    anomaly_score: parseNumber(row.anomaly_score),
    is_model_flagged: parseBoolean(row.is_model_flagged)
  }));
};

export const fetchAnomalyBatchSummary = (): Promise<AnomalyBatchSummary[]> => {
  return fetchCsvData('/data/coldmed_anomaly_batch_summary.csv', (row: any) => ({
    ...row,
    nombre_profils_signales: parseNumber(row.nombre_profils_signales),
    anomaly_score_max: parseNumber(row.anomaly_score_max),
    temperature_max_signalee: parseNumber(row.temperature_max_signalee),
    deviation_contextuelle_max: parseNumber(row.deviation_contextuelle_max),
    rang_priorite: row.rang_priorite ? parseNumber(row.rang_priorite) : undefined,
    is_top_5_priority: row.is_top_5_priority ? parseBoolean(row.is_top_5_priority) : undefined
  }));
};

export const fetchAnomalyTop5Priority = (): Promise<AnomalyBatchSummary[]> => {
  return fetchCsvData('/data/coldmed_anomaly_top5_priority.csv', (row: any) => ({
    ...row,
    nombre_profils_signales: parseNumber(row.nombre_profils_signales),
    anomaly_score_max: parseNumber(row.anomaly_score_max),
    temperature_max_signalee: parseNumber(row.temperature_max_signalee),
    deviation_contextuelle_max: parseNumber(row.deviation_contextuelle_max),
    rang_priorite: row.rang_priorite ? parseNumber(row.rang_priorite) : undefined,
    is_top_5_priority: row.is_top_5_priority ? parseBoolean(row.is_top_5_priority) : undefined
  }));
};

export const fetchAnomalyKpis = (): Promise<AnomalyKpi[]> => {
  return fetchCsvData('/data/coldmed_anomaly_kpis.csv', (row: any) => ({
    KPI: row.KPI,
    Valeur: parseNumber(row.Valeur)
  }));
};

export const fetchAnomalySensitivity = (): Promise<AnomalySensitivityRow[]> => {
  return fetchCsvData('/data/coldmed_anomaly_sensitivity.csv', (row: any) => ({
    contamination: parseNumber(row.contamination),
    nombre_profils_signales: parseNumber(row.nombre_profils_signales),
    nombre_lots_concernes: parseNumber(row.nombre_lots_concernes)
  }));
};

export const fetchClassificationMetrics = (): Promise<ClassificationMetric[]> => {
  return fetchCsvData('/data/coldmed_classification_model_metrics.csv', (row: any) => ({
    Model: row.model_name,
    Accuracy: parseNumber(row.accuracy),
    Balanced_Accuracy: parseNumber(row.balanced_accuracy),
    Precision: parseNumber(row.precision),
    Recall: parseNumber(row.recall),
    F1_Score: parseNumber(row.f1),
    Evaluation_Method: row.evaluation_method
  }));
};

export const fetchClassificationFeatureImportance = (): Promise<ClassificationFeatureImportance[]> => {
  return fetchCsvData('/data/coldmed_classification_feature_importance.csv', (row: any) => ({
    feature: row.feature,
    importance: parseNumber(row.importance_or_coefficient),
    model: row.model_name
  }));
};

export const fetchClassificationPredictions = (): Promise<ClassificationPrediction[]> => {
  return fetchCsvData('/data/coldmed_classification_predictions_exploratory.csv', (row: any) => ({
    batch_id: row.batch_id,
    issue_finale_observee: row.issue_finale_observee,
    target_encoded: parseNumber(row.target),
    pred_logistic: parseNumber(row.logistic_regression_oof_prediction),
    pred_tree: parseNumber(row.decision_tree_oof_prediction)
  }));
};

export const validateData = (batches: BatchData[]): boolean => {
  const total = batches.length;
  const delivered = batches.filter(b => b.issue_finale_observee === "Livré au site de vaccination").length;
  const explicitDiscard = batches.filter(b => b.issue_finale_observee === "Écart explicite observé").length;
  const discordant = batches.filter(b => b.issue_finale_observee === "Discordance à valider").length;
  const expired = batches.filter(b => b.signal_expiration).length;
  const prolonged = batches.filter(b => b.signal_excursion_prolongee).length;
  const over8 = batches.filter(b => b.signal_temperature_superieure_8).length;

  return (
    total === 30 &&
    delivered === 10 &&
    explicitDiscard === 17 &&
    discordant === 3 &&
    expired === 5 &&
    prolonged === 15 &&
    over8 === 16
  );
};
