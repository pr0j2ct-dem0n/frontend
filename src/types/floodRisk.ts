export type FloodMapRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';

export const FLOOD_RISK_LABELS: Record<FloodMapRiskLevel, string> = {
  LOW: '낮음',
  MEDIUM: '보통',
  HIGH: '높음',
  VERY_HIGH: '매우 높음',
};

export const FLOOD_RISK_COLORS: Record<FloodMapRiskLevel, string> = {
  LOW: '#3B82F6',
  MEDIUM: '#EAB308',
  HIGH: '#F97316',
  VERY_HIGH: '#EF4444',
};

export interface FloodRiskMapArea {
  id: string;
  name: string;
  district: string;
  riskLevel: FloodMapRiskLevel;
  expectedFloodDepthM: number;
  rainfallFrequency: string;
  latitude: number;
  longitude: number;
  radiusM: number;
}
