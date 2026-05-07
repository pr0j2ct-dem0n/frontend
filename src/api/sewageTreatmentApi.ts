import type { SewageTreatmentFacility } from '../types/sewageTreatment';
import { mockSewageTreatmentFacilities } from '../mocks/sewageTreatmentMock';

// TODO: 실제 API 연동 시 아래 주석을 해제하고 mock import를 제거하세요.
// import apiClient from './client';

/**
 * 공공하수처리시설 현황 조회
 * 출처: 공공데이터포털 - 한국환경공단_공공하수처리시설 현황
 *
 * Real API: GET /api/map-layers/sewage-treatment-facilities
 */
export async function getSewageTreatmentFacilities(): Promise<SewageTreatmentFacility[]> {
  // Real API:
  // return (await apiClient.get<SewageTreatmentFacility[]>('/api/map-layers/sewage-treatment-facilities')).data;
  return Promise.resolve(mockSewageTreatmentFacilities);
}
