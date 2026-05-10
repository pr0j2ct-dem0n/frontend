import type { RiskZone } from '../types/risk';
import type { RiskLevel } from '../types/dashboard';
import type { PredictAreaItem } from './backendTypes';
import { getPredictData } from './predictCache';
import { getGuCoords } from '../utils/guCoordinates';

export function toRiskLevel(korean: string): RiskLevel {
  if (korean === '위험') return 'DANGER';
  if (korean === '경계' || korean === '경고') return 'WARNING';
  if (korean === '주의') return 'CAUTION';
  return 'SAFE';
}

export function toRiskZone(area: PredictAreaItem, index: number): RiskZone {
  const coords = getGuCoords(area.gu_name);
  const occupancy = area.metrics.drainpipe_occupancy_ratio;
  const estimatedLevelM = Math.round((occupancy / 100) * 2.0 * 100) / 100;

  return {
    id: `GU-${String(index + 1).padStart(3, '0')}`,
    name: area.gu_name,
    district: area.gu_name,
    latitude: coords.lat,
    longitude: coords.lng,
    riskScore: Math.round(area.final_risk_score),
    riskLevel: toRiskLevel(area.risk_level),
    reasons: area.reasons,
    metrics: {
      rainfallMm: area.metrics.rainfall_mm,
      sewerLevelM: estimatedLevelM,
      sewerCapacityRate: Math.round(occupancy),
    },
  };
}

export async function getRiskZones(): Promise<RiskZone[]> {
  const data = await getPredictData();
  return data.areas.map(toRiskZone);
}
