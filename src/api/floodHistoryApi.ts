import apiClient from './client';
import type { FloodHistoryGuItem } from './backendTypes';

export async function getFloodHistoryItems(): Promise<FloodHistoryGuItem[]> {
  try {
    const { data } = await apiClient.get<FloodHistoryGuItem[]>('/flood-history/gu');
    return data;
  } catch {
    return [];
  }
}

export function getFloodCountForDistrict(items: FloodHistoryGuItem[], district: string): number {
  return items
    .filter((h) => h.gu_name.includes(district))
    .reduce((s, h) => s + h.flood_count, 0);
}
