import type { FloodRiskMapArea } from '../types/floodRisk';
import { mockFloodRiskMapAreas } from '../mocks/floodRiskMapMock';

// TODO: 실제 API 연동 시 아래 주석을 해제하고 mock import를 제거하세요.
// import apiClient from './client';

/**
 * 홍수위험지도 레이어 데이터 조회
 * 출처: 공공데이터포털 - 기후에너지환경부 한강홍수통제소_홍수위험지도
 *
 * Real API: GET /api/map-layers/flood-risk-map
 */
export async function getFloodRiskMapAreas(): Promise<FloodRiskMapArea[]> {
  // Real API:
  // return (await apiClient.get<FloodRiskMapArea[]>('/api/map-layers/flood-risk-map')).data;
  return Promise.resolve(mockFloodRiskMapAreas);
}
