/** /rainfall/gu */
export interface RainfallGuItem {
  gu: string;
  rainfall_avg_10min: number;
  rainfall_max_10min: number;
  station_count: number;
}

/** /sewer-pipe/gu */
export interface SewerPipeGuItem {
  gu: string;
  pipe_level_avg: number;
  pipe_level_max: number;
  occupancy_ratio: number;
  status: string;
  overflow_risk: boolean;
  station_count: number;
}

/** /predict/flood/areas */
export interface PredictScores {
  rain_capacity_risk: number;
  drainpipe_level_risk: number;
  river_level_risk: number;
  flood_history_risk: number;
  sewer_structure_risk: number;
}
export interface PredictMetrics {
  rainfall_mm: number;
  danger_rainfall_mm: number;
  inflow_m3: number;
  effective_capacity_m3: number;
  drainpipe_occupancy_ratio: number;
}
export interface PredictAreaItem {
  gu_name: string;
  scores: PredictScores;
  final_risk_score: number;
  risk_level: string;
  metrics: PredictMetrics;
  flood_history: { flood_count: number };
  reasons: string[];
  debug?: Record<string, unknown> | null;
}
export interface PredictResponse {
  base_time: string;
  areas: PredictAreaItem[];
}

/** /flood-history/gu */
export interface FloodHistoryGuItem {
  gu_name: string;
  flood_count: number;
  flood_history_risk: number;
}
