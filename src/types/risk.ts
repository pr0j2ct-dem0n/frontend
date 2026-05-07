import type { RiskLevel } from './dashboard';

export interface RiskMetrics {
  rainfallMm: number;
  sewerLevelM: number;
  sewerCapacityRate: number;
}

export interface RiskZone {
  id: string;
  name: string;
  district: string;
  latitude: number;
  longitude: number;
  riskScore: number;
  riskLevel: RiskLevel;
  reasons: string[];
  metrics: RiskMetrics;
}
