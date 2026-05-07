import type { DashboardSummary } from '../types/dashboard';
import { mockDashboardSummary } from '../mocks/dashboardMock';

// TODO: replace with real API call
// import apiClient from './client';

export async function getDashboardSummary(): Promise<DashboardSummary> {
  // Real API: return (await apiClient.get<DashboardSummary>('/api/dashboard/summary')).data;
  return Promise.resolve({ ...mockDashboardSummary, updatedAt: new Date().toISOString() });
}
