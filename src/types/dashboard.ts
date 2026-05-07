export type RiskLevel = 'SAFE' | 'CAUTION' | 'WARNING' | 'DANGER';

export interface DashboardSummary {
  currentRainfallMm: number;
  rainfallChangeRate: number;
  averageSewerLevelM: number;
  averageSewerLevelChangeRate: number;
  riskZoneCount: number;
  highestRiskArea: string;
  highestRiskLevel: RiskLevel;
  overallRiskLevel: RiskLevel;
  updatedAt: string;
}
