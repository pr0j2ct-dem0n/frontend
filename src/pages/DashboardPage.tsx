import { useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { DashboardSummary } from '../types/dashboard';
import type { RainfallTimeseries } from '../types/rainfall';
import type { SewerLevelTimeseries } from '../types/sewer';
import type { RiskZone } from '../types/risk';

import { getDashboardSummary } from '../api/dashboardApi';
import { getRainfallTimeseries } from '../api/rainfallApi';
import { getSewerLevelTimeseries } from '../api/sewerLevelApi';
import { getRiskZones } from '../api/riskApi';

import DashboardLayout from '../components/layout/DashboardLayout';
import Header from '../components/layout/Header';
import KpiGrid from '../components/kpi/KpiGrid';
import SeoulRiskMap from '../components/map/SeoulRiskMap';
import AlertPanel from '../components/alerts/AlertPanel';
import RainfallChart from '../components/charts/RainfallChart';
import SewerLevelChart from '../components/charts/SewerLevelChart';
import RiskTrendChart from '../components/charts/RiskTrendChart';

const REFRESH_INTERVAL_MS = 60_000;

const SEOUL_DATA_SOURCES = [
  { name: '서울시 하천 수위 현황',     purpose: '하천 수위, 침수수위, 통제수위 기반 위험 보조 판단' },
  { name: '서울시 하수관로 수위 현황', purpose: '하수관 수위, 수위 상승률, 통신상태 기반 막힘·역류 위험 판단' },
  { name: '서울시 강우량 정보',        purpose: '10분 단위 강우량 및 단기 강우 증가율 분석' },
  { name: '서울시 강수량 현황 정보',   purpose: '지역별·기간별 강수 패턴 참고 및 위험도 보조 분석' },
  { name: '서울시 침수흔적도',         purpose: '과거 침수 발생 이력 기반 취약지역 가중치 산정' },
];

const RISK_FACTORS = [
  '최근 강우량 (10분/30분/1시간)',
  '하수관 수위 및 수위 상승률',
  '하수도 용량 대비 수위 비율',
  '과거 침수이력 가중치',
  '하수도 시설 노후도 정보',
  'AI 위험 예측 점수',
];

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 text-slate-700 text-base font-semibold">
      <span className="w-1 h-[18px] rounded-full bg-blue-600 inline-block" />
      {children}
    </h2>
  );
}

function ChartSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 h-52 flex flex-col gap-3 animate-pulse">
      <div className="h-3 w-1/3 bg-slate-200 rounded" />
      <div className="flex-1 bg-slate-100 rounded-lg" />
      <div className="h-2 w-1/2 bg-slate-200 rounded" />
    </div>
  );
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [rainfallData, setRainfallData] = useState<RainfallTimeseries[]>([]);
  const [sewerData, setSewerData] = useState<SewerLevelTimeseries[]>([]);
  const [riskZones, setRiskZones] = useState<RiskZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isDataSrcOpen, setIsDataSrcOpen] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const [s, r, sw, rz] = await Promise.all([
        getDashboardSummary(),
        getRainfallTimeseries().catch(() => [] as RainfallTimeseries[]),
        getSewerLevelTimeseries().catch(() => [] as SewerLevelTimeseries[]),
        getRiskZones().catch(() => [] as RiskZone[]),
      ]);
      setSummary(s);
      setRainfallData(r);
      setSewerData(sw);
      setRiskZones(rz);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('데이터 로딩 실패:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const timer = setInterval(fetchAll, REFRESH_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [fetchAll]);

  return (
    <DashboardLayout
      header={
        <Header
          summary={summary}
          lastRefresh={lastRefresh}
          onRefresh={fetchAll}
        />
      }
    >
      <div className="space-y-5">

        {/* ── KPI 영역 — null 시 자체 skeleton 표시 ── */}
        <KpiGrid summary={summary} />

        {/* ── 지도 + 상황 패널 ── */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
          {/* 지도 */}
          <div className="xl:col-span-3 flex flex-col gap-2">
            <SectionTitle>서울시 위험 구간 현황</SectionTitle>
            <div className="relative h-[320px] sm:h-[400px] xl:h-[520px]">
              <SeoulRiskMap riskZones={riskZones} />
              {loading && (
                <div className="absolute inset-0 bg-white/80 rounded-xl flex flex-col items-center justify-center gap-2.5 z-[1000] pointer-events-none">
                  <div className="w-8 h-8 border-[3px] border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-slate-500 text-sm font-medium">데이터를 불러오는 중입니다</p>
                </div>
              )}
            </div>
          </div>

          {/* 상황 패널 */}
          <div className="xl:col-span-2 flex flex-col gap-2">
            <SectionTitle>실시간 상황 패널</SectionTitle>
            <div className="h-[420px] xl:h-[520px]">
              <AlertPanel zones={riskZones} />
            </div>
          </div>
        </div>

        {/* ── 시계열 분석 차트 ── */}
        <div className="space-y-2">
          <SectionTitle>시계열 분석</SectionTitle>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ChartSkeleton />
              <ChartSkeleton />
              <ChartSkeleton />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <RainfallChart data={rainfallData} />
              <SewerLevelChart data={sewerData} />
              <RiskTrendChart zones={riskZones} />
            </div>
          )}
        </div>

        {/* ── 데이터 출처 및 위험도 산정 기준 (정적 — 항상 즉시 표시) ── */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

          {/* 헤더: 모바일에서는 접기/펼치기 버튼, 데스크톱에서는 일반 헤더 */}
          <button
            type="button"
            onClick={() => setIsDataSrcOpen((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-4 text-left md:cursor-default"
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-slate-700 text-sm font-semibold">데이터 출처 및 위험도 산정 기준</h3>
            </div>
            {/* 아이콘: 모바일에서만 표시 */}
            <svg
              className={`md:hidden w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ${isDataSrcOpen ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* 내용: 모바일에서 접기/펼치기, 데스크톱에서 항상 표시 */}
          <div className={`px-5 pb-5 ${isDataSrcOpen ? 'block' : 'hidden'} md:block`}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">

              {/* 데이터 출처 */}
              <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-blue-800 text-xs font-bold leading-tight">서울 열린데이터광장</p>
                    <p className="text-blue-500 text-[10px]">data.seoul.go.kr</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {SEOUL_DATA_SOURCES.map((src) => (
                    <li key={src.name}>
                      <p className="text-slate-700 text-xs font-semibold leading-snug">{src.name}</p>
                      <p className="text-slate-500 text-[11px] mt-0.5 leading-snug">{src.purpose}</p>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 위험도 산정 요소 */}
              <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-md bg-slate-600 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <p className="text-slate-700 text-xs font-bold">위험도 산정 요소</p>
                </div>
                <ul className="space-y-1.5">
                  {RISK_FACTORS.map((factor, i) => (
                    <li key={factor} className="flex items-start gap-2 text-xs">
                      <span className="mt-0.5 w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold flex-shrink-0 bg-blue-100 text-blue-600">
                        {i + 1}
                      </span>
                      <span className="leading-snug text-slate-600">{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-slate-500">
              <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                본 위험도는 강우량, 하수관 수위, 하천 수위, 과거 침수이력 등 실시간 데이터를 AI 모델로 종합 분석하여 표시됩니다.
                <span className="text-slate-400 ml-1.5">※ 위험도 계산은 백엔드에서 수행하며, 프론트엔드는 결과를 시각화합니다.</span>
              </span>
              <span className="ml-auto text-slate-400 whitespace-nowrap">위험도 산정 알고리즘 ver 1.1 · 갱신주기 1분</span>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
