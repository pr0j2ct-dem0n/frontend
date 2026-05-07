import type { RiskZone } from '../types/risk';
import { mockRiskZones } from '../mocks/riskZonesMock';

// TODO: replace with real API call
// import apiClient from './client';

export async function getRiskZones(): Promise<RiskZone[]> {
  // Real API: return (await apiClient.get<RiskZone[]>('/api/risk-zones')).data;
  return Promise.resolve(mockRiskZones);
}
