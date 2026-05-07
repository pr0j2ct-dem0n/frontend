import type { DashboardSummary } from '../types/dashboard';

export const mockDashboardSummary: DashboardSummary = {
  currentRainfallMm: 32.4,
  rainfallChangeRate: 18.5,
  averageSewerLevelM: 1.87,
  averageSewerLevelChangeRate: 12.3,
  riskZoneCount: 7,
  highestRiskArea: '강남구 논현동',
  highestRiskLevel: 'DANGER',
  overallRiskLevel: 'WARNING',
  updatedAt: new Date().toISOString(),
};
