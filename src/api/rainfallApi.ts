import type { RainfallTimeseries } from '../types/rainfall';
import { mockRainfallTimeseries } from '../mocks/rainfallMock';

// TODO: replace with real API call
// import apiClient from './client';

export async function getRainfallTimeseries(): Promise<RainfallTimeseries[]> {
  // Real API: return (await apiClient.get<RainfallTimeseries[]>('/api/rainfall/timeseries')).data;
  return Promise.resolve(mockRainfallTimeseries);
}
