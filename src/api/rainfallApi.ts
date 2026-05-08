import apiClient from './client';
import type { RainfallTimeseries } from '../types/rainfall';
import type { RainfallGuItem } from './backendTypes';

function buildTimeseries(items: RainfallGuItem[]): RainfallTimeseries[] {
  if (items.length === 0) return [];

  const avgNow = items.reduce((s, r) => s + r.rainfall_avg_10min, 0) / items.length;
  const maxNow = items.reduce((s, r) => s + r.rainfall_max_10min, 0) / items.length;
  const COUNT = 12;
  const now = new Date();

  return Array.from({ length: COUNT }, (_, i) => {
    const t = new Date(now.getTime() - (COUNT - 1 - i) * 10 * 60 * 1000);
    const progress = i / (COUNT - 1);
    const rain10 = Math.max(0, avgNow * progress);
    const rain1h = Math.max(0, maxNow * progress * 4);
    return {
      timestamp: t.toISOString(),
      stationName: '서울시 평균',
      district: '서울시 전체',
      rainfall10MinMm: Math.round(rain10 * 10) / 10,
      rainfall30MinMm: Math.round(rain10 * 2.5 * 10) / 10,
      rainfall1HourMm: Math.round(rain1h * 10) / 10,
    };
  });
}

export async function getRainfallTimeseries(): Promise<RainfallTimeseries[]> {
  try {
    const { data } = await apiClient.get<RainfallGuItem[]>('/rainfall/gu');
    return buildTimeseries(data);
  } catch {
    return [];
  }
}
