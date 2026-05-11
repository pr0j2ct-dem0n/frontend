import apiClient from './client';
import type { SewerGuRiskItem, SewerLevelTimeseries, SewerSensor } from '../types/sewer';
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

const MAX_CAPACITY_M = 2.0;
const CACHE_TTL = 55_000;
const TIMESERIES_BUCKET_MINUTES = 5;
const TIMESERIES_WINDOW_MS = 60 * 60 * 1000;

let _cache: { rows: DrainpipeRow[]; fetchedAt: number } | null = null;
let _inflight: Promise<DrainpipeRow[]> | null = null;

interface SewerPipeGuRow {
  gu?: string;
  gu_name?: string;
  pipe_level_avg?: number;
  avg_water_level?: number;
  pipe_level_max?: number;
  max_water_level?: number;
  occupancy_ratio?: number;
  water_risk?: number;
  infra_score?: number;
  total_risk?: number;
  status?: string;
  overflow_risk?: boolean;
  station_count?: number;
  max_capacity?: number;
  facility_capacity?: number;
}

function mapGuRiskRow(row: SewerPipeGuRow): SewerGuRiskItem | null {
  const avgWaterLevel = row.pipe_level_avg ?? row.avg_water_level ?? 0;
  const maxWaterLevel = row.pipe_level_max ?? row.max_water_level ?? avgWaterLevel;
  if (maxWaterLevel < 0) return null;
  const maxCapacity = row.max_capacity ?? MAX_CAPACITY_M;
  const ratioFromMax = (maxWaterLevel / maxCapacity) * 100;
  const waterRisk = Math.min(row.water_risk ?? row.occupancy_ratio ?? ratioFromMax, 100);
  const infraScore = Math.max(0, Math.min(100, row.infra_score ?? 0));
  const totalRiskRaw = row.total_risk ?? (waterRisk - (0.3 * infraScore));
  const totalRisk = Math.max(0, Math.min(100, totalRiskRaw));
  const normalizedStatus = normalizeGuStatus(row.status, totalRisk);
  return {
    guName: row.gu ?? row.gu_name ?? '알수없음',
    avgWaterLevel: Math.round(avgWaterLevel * 100) / 100,
    maxWaterLevel: Math.round(maxWaterLevel * 100) / 100,
    stationCount: row.station_count ?? 0,
    maxCapacity,
    waterRisk: Math.round(waterRisk * 10) / 10,
    infraScore: Math.round(infraScore * 10) / 10,
    totalRisk: Math.round(totalRisk * 10) / 10,
    facilityCapacity: Math.round((row.facility_capacity ?? 0) * 100) / 100,
    status: normalizedStatus,
  };
}

function statusFromRatio(ratio: number): 'NORMAL' | 'CAUTION' | 'WARNING' | 'DANGER' {
  if (ratio >= 80) return 'DANGER';
  if (ratio >= 60) return 'WARNING';
  if (ratio >= 40) return 'CAUTION';
  return 'NORMAL';
}

function normalizeGuStatus(status: string | undefined, ratio: number): 'NORMAL' | 'CAUTION' | 'WARNING' | 'DANGER' {
  const upper = status?.toUpperCase();
  if (upper === 'NORMAL' || upper === 'CAUTION' || upper === 'WARNING' || upper === 'DANGER') {
    return upper;
  }
  return statusFromRatio(ratio);
}

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
  if (rate >= 80) return 'DANGER';
  if (rate >= 60) return 'WARNING';
  if (rate >= 40) return 'CAUTION';
  return 'SAFE';
}

export async function getSewerLevelTimeseries(): Promise<SewerLevelTimeseries[]> {
  try {
    const rows = await fetchRawRows();
    const validRows = rows
      .map((row) => {
        const ts = row.MSRMT_YMD.replace(' ', 'T').replace(/\.0$/, '');
        const ms = new Date(ts).getTime();
        return { row, ms };
      })
      .filter(({ row, ms }) => Number.isFinite(ms) && row.MSRMT_WATL >= 0);

    if (validRows.length === 0) return [];

    const latestMs = validRows.reduce((max, item) => (item.ms > max ? item.ms : max), 0);
    const cutoffMs = latestMs - TIMESERIES_WINDOW_MS;
    const bucketSizeMs = TIMESERIES_BUCKET_MINUTES * 60 * 1000;
    const byBucket = new Map<number, number[]>();

    for (const { row, ms } of validRows) {
      if (ms < cutoffMs) continue;
      const bucketStart = Math.floor(ms / bucketSizeMs) * bucketSizeMs;
      const arr = byBucket.get(bucketStart) ?? [];
      arr.push(row.MSRMT_WATL);
      byBucket.set(bucketStart, arr);
    }

    const result = [...byBucket.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([bucketStart, levels]) => ({
        timestamp: new Date(bucketStart).toISOString(),
        sensorId: 'SWR-SEOUL-AVG',
        locationName: '서울시 평균',
        district: '서울시 전체',
        waterLevelM: Math.round((levels.reduce((s, v) => s + v, 0) / levels.length) * 100) / 100,
        levelChangeRate: 0,
        communicationStatus: 'NORMAL' as const,
      }));

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
    const validRows = rows.filter((row) => row.MSRMT_WATL >= 0);
    const latestPerSensor = new Map<string, DrainpipeRow>();
    for (const row of validRows) {
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
    const timeseries = await getSewerLevelTimeseries();
    if (timeseries.length === 0) return 0;
    return timeseries[timeseries.length - 1].waterLevelM;
  } catch {
    return 0;
  }
}

export async function getSewerGuRiskTop10(): Promise<SewerGuRiskItem[]> {
  const all = await getSewerGuRisks();
  return [...all].sort((a, b) => b.totalRisk - a.totalRisk).slice(0, 10);
}

export async function getSewerGuRisks(): Promise<SewerGuRiskItem[]> {
  try {
    const { data } = await apiClient.get('/sewer-pipe/gu');
    const rows: SewerPipeGuRow[] = data?.items ?? data ?? [];
    const result = rows.map(mapGuRiskRow).filter((row): row is SewerGuRiskItem => row !== null);
    return result;
  } catch (err) {
    console.error('[sewer-pipe gu error]', err);
    return [];
  }
}
