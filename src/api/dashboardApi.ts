import apiClient from './client';
import type { DashboardSummary, RiskLevel } from '../types/dashboard';
import type { RainfallGuItem } from './backendTypes';
import { getPredictData } from './predictCache';
import { toRiskLevel } from './riskApi';
import { getAverageSewerLevelM, getSewerGuRisks } from './sewerLevelApi';

const LEVEL_ORDER: Record<RiskLevel, number> = { DANGER: 3, WARNING: 2, CAUTION: 1, SAFE: 0 };
function maxLevel(a: RiskLevel, b: RiskLevel): RiskLevel {
  return LEVEL_ORDER[a] >= LEVEL_ORDER[b] ? a : b;
}
function fromTotalRiskStatus(status: string): RiskLevel {
  const upper = status.toUpperCase();
  if (upper === 'DANGER') return 'DANGER';
  if (upper === 'WARNING') return 'WARNING';
  if (upper === 'CAUTION') return 'CAUTION';
  return 'SAFE';
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const [rainfallRes, averageSewerLevelM, predictData, sewerGuRisks] = await Promise.all([
    apiClient.get<RainfallGuItem[]>('/rainfall/gu').catch(() => null),
    getAverageSewerLevelM().catch(() => 0),
    getPredictData(),
    getSewerGuRisks().catch(() => []),
  ]);

  // 강우량
  let currentRainfallMm = 0;
  if (rainfallRes && rainfallRes.data.length > 0) {
    const items = rainfallRes.data;
    currentRainfallMm = Math.round((items.reduce((s, r) => s + r.rainfall_avg_10min, 0) / items.length) * 10) / 10;
  }

  // 위험도
  const { areas, base_time } = predictData;
  const updatedAt = base_time.replace(' ', 'T') + ':00';

  let riskZoneCount = 0;
  let highestRiskArea = '-';
  let highestRiskLevel: RiskLevel = 'SAFE';
  let overallRiskLevel: RiskLevel = 'SAFE';
  let topScore = -1;

  for (const area of areas) {
    const level = toRiskLevel(area.risk_level);
    overallRiskLevel = maxLevel(overallRiskLevel, level);
    if (level !== 'SAFE') riskZoneCount++;
    if (area.final_risk_score > topScore) topScore = area.final_risk_score;
  }

  if (sewerGuRisks.length > 0) {
    const topRiskGu = [...sewerGuRisks].sort((a, b) => b.totalRisk - a.totalRisk)[0];
    highestRiskArea = topRiskGu.guName;
    highestRiskLevel = fromTotalRiskStatus(topRiskGu.status);
  } else if (areas.length > 0) {
    const topArea = [...areas].sort((a, b) => b.final_risk_score - a.final_risk_score)[0];
    highestRiskArea = topArea.gu_name;
    highestRiskLevel = toRiskLevel(topArea.risk_level);
  }

  return {
    currentRainfallMm,
    rainfallChangeRate: 0,
    averageSewerLevelM,
    averageSewerLevelChangeRate: 0,
    riskZoneCount,
    highestRiskArea,
    highestRiskLevel,
    overallRiskLevel,
    updatedAt,
  };
}
