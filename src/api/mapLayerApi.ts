import type { FloodHistoryLayer, PumpStation } from '../types/map';
import { mockFloodHistory, mockPumpStations } from '../mocks/mapLayerMock';

// TODO: replace with real API call
// import apiClient from './client';

export async function getFloodHistory(): Promise<FloodHistoryLayer[]> {
  // Real API: return (await apiClient.get<FloodHistoryLayer[]>('/api/map-layers/flood-history')).data;
  return Promise.resolve(mockFloodHistory);
}

export async function getPumpStations(): Promise<PumpStation[]> {
  // Real API: return (await apiClient.get<PumpStation[]>('/api/map-layers/pump-stations')).data;
  return Promise.resolve(mockPumpStations);
}
