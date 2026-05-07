import type { SewerLevelTimeseries } from '../types/sewer';
import { mockSewerLevelTimeseries } from '../mocks/sewerLevelMock';

// TODO: replace with real API call
// import apiClient from './client';

export async function getSewerLevelTimeseries(): Promise<SewerLevelTimeseries[]> {
  // Real API: return (await apiClient.get<SewerLevelTimeseries[]>('/api/sewer-level/timeseries')).data;
  return Promise.resolve(mockSewerLevelTimeseries);
}
