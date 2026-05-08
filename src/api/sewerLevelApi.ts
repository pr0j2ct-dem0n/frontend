import apiClient from './client';
import type { SewerLevelTimeseries, SewerSensor } from '../types/sewer';
import type { RiskLevel } from '../types/dashboard';

interface DrainpipeRow {
  UNQ_NO: string;
  SE_CD: string;
  SE_NM: string;
  MSRMT_YMD: string;
  MSRMT_WATL: number;
  SGN_STTS: string;
  PSTN_INFO: string;
}

interface DrainpipeRawResponse {
  DrainpipeMonitoringInfo: {
    list_total_count: number;
    RESULT: { CODE: string; MESSAGE: string };
    row: DrainpipeRow[];
  };
}

const MAX_CAPACITY_M = 2.5;
const CACHE_TTL = 55_000;

let _cache: { rows: DrainpipeRow[]; fetchedAt: number } | null = null;
let _inflight: Promise<DrainpipeRow[]> | null = null;

async function fetchRawRows(): Promise<DrainpipeRow[]> {
  if (_cache && Date.now() - _cache.fetchedAt < CACHE_TTL) return _cache.rows;
  if (_inflight) return _inflight;

  _inflight = apiClient
    .get<DrainpipeRawResponse>('/sewer-pipe/raw')
    .then(({ data }) => {
      console.log('[sewer-pipe/raw response]', data);
      const rows = data?.DrainpipeMonitoringInfo?.row ?? [];
      _cache = { rows, fetchedAt: Date.now() };
      return rows;
    })
    .finally(() => { _inflight = null; });

  return _inflight;
}

function parseStatus(sgn: string): 'NORMAL' | 'DELAYED' | 'DISCONNECTED' {
  if (sgn.includes('양호') || sgn.includes('정상')) return 'NORMAL';
  if (sgn.includes('불량') || sgn.includes('불통')) return 'DISCONNECTED';
  return 'DELAYED';
}

function toRiskLevel(levelM: number): RiskLevel {
  const rate = (levelM / MAX_CAPACITY_M) * 100;
  if (rate >= 90) return 'DANGER';
  if (rate >= 75) return 'WARNING';
  if (rate >= 50) return 'CAUTION';
  return 'SAFE';
}

export async function getSewerLevelTimeseries(): Promise<SewerLevelTimeseries[]> {
  try {
    const rows = await fetchRawRows();
    const byTime = new Map<string, number[]>();
    for (const row of rows) {
      const ts = row.MSRMT_YMD.replace(' ', 'T').replace(/\.0$/, '');
      const arr = byTime.get(ts) ?? [];
      arr.push(row.MSRMT_WATL);
      byTime.set(ts, arr);
    }
    const result = [...byTime.entries()]
      .map(([ts, levels]) => ({
        timestamp: ts,
        sensorId: 'SWR-SEOUL-AVG',
        locationName: '서울시 평균',
        district: '서울시 전체',
        waterLevelM:
          Math.round((levels.reduce((s, v) => s + v, 0) / levels.length) * 100) / 100,
        levelChangeRate: 0,
        communicationStatus: 'NORMAL' as const,
      }))
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    console.log('[sewer-level timeseries normalized] last 3:', result.slice(-3));
    return result;
  } catch (err) {
    console.error('[sewer-level timeseries error]', err);
    return [];
  }
}

export async function getSewerSensors(): Promise<SewerSensor[]> {
  try {
    const rows = await fetchRawRows();
    const latestPerSensor = new Map<string, DrainpipeRow>();
    for (const row of rows) {
      const existing = latestPerSensor.get(row.UNQ_NO);
      if (!existing || row.MSRMT_YMD > existing.MSRMT_YMD) {
        latestPerSensor.set(row.UNQ_NO, row);
      }
    }
    const result = [...latestPerSensor.values()].map((row) => ({
      id: row.UNQ_NO,
      locationName: row.PSTN_INFO,
      district: row.SE_NM,
      waterLevelM: Math.round(row.MSRMT_WATL * 100) / 100,
      maxCapacityM: MAX_CAPACITY_M,
      capacityRate: Math.round((row.MSRMT_WATL / MAX_CAPACITY_M) * 100),
      levelChangeRate: 0,
      communicationStatus: parseStatus(row.SGN_STTS),
      riskLevel: toRiskLevel(row.MSRMT_WATL),
    }));
    console.log('[sewer-level sensors normalized] first 3:', result.slice(0, 3));
    return result;
  } catch (err) {
    console.error('[sewer-level sensors error]', err);
    return [];
  }
}

export async function getAverageSewerLevelM(): Promise<number> {
  try {
    const rows = await fetchRawRows();
    if (rows.length === 0) return 0;
    // Use only the most recent timestamp's readings
    const latestTs = rows.reduce((m, r) => (r.MSRMT_YMD > m ? r.MSRMT_YMD : m), '');
    const latest = rows.filter((r) => r.MSRMT_YMD === latestTs);
    const avg = latest.reduce((s, r) => s + r.MSRMT_WATL, 0) / latest.length;
    return Math.round(avg * 100) / 100;
  } catch {
    return 0;
  }
}
