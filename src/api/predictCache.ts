import apiClient from './client';
import type { PredictResponse } from './backendTypes';

let _cache: { data: PredictResponse; fetchedAt: number } | null = null;
let _inflight: Promise<PredictResponse> | null = null;

const CACHE_TTL_MS = 55_000; // 55초 (갱신 주기 60초보다 약간 짧게)

function nowRange() {
  const end = new Date();
  const start = new Date(end.getTime() - 60 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().slice(0, 19);
  return { start_time: fmt(start), end_time: fmt(end) };
}

export async function getPredictData(): Promise<PredictResponse> {
  // 캐시 유효하면 즉시 반환
  if (_cache && Date.now() - _cache.fetchedAt < CACHE_TTL_MS) {
    return _cache.data;
  }
  // 이미 진행 중인 요청이 있으면 재사용
  if (_inflight) return _inflight;

  _inflight = apiClient
    .get<PredictResponse>('/predict/flood/areas', { params: nowRange() })
    .then((res) => {
      _cache = { data: res.data, fetchedAt: Date.now() };
      return res.data;
    })
    .finally(() => {
      _inflight = null;
    });

  return _inflight;
}

/** 캐시 강제 무효화 (수동 새로고침 시) */
export function invalidatePredictCache() {
  _cache = null;
}
