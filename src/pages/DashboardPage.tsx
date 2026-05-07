import { useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { DashboardSummary } from '../types/dashboard';
import type { RainfallTimeseries } from '../types/rainfall';
import type { SewerLevelTimeseries } from '../types/sewer';
import type { RiskZone } from '../types/risk';
import type { PumpStation } from '../types/map';
import type { SewageTreatmentFacility } from '../types/sewageTreatment';

import { getDashboardSummary } from '../api/dashboardApi';
import { getRainfallTimeseries } from '../api/rainfallApi';
import { getSewerLevelTimeseries } from '../api/sewerLevelApi';
import { getRiskZones } from '../api/riskApi';
import { getPumpStations } from '../api/mapLayerApi';
import { getSewageTreatmentFacilities } from '../api/sewageTreatmentApi';

import DashboardLayout from '../components/layout/DashboardLayout';
import Header from '../components/layout/Header';
import KpiGrid from '../components/kpi/KpiGrid';
import SeoulRiskMap from '../components/map/SeoulRiskMap';
import AlertPanel from '../components/alerts/AlertPanel';
import RainfallChart from '../components/charts/RainfallChart';
import SewerLevelChart from '../components/charts/SewerLevelChart';
import RiskTrendChart from '../components/charts/RiskTrendChart';

const REFRESH_INTERVAL_MS = 60_000;

/* ── 데이터 출처 정의 ── */
const SEOUL_DATA_SOURCES = [
  { name: '서울시 하천 수위 현황',      purpose: '하천 수위, 침수수위, 통제수위 기반 위험 보조 판단' },
  { name: '서울시 하수관로 수위 현황',  purpose: '하수관 수위, 수위 상승률, 통신상태 기반 막힘·역류 위험 판단' },
  { name: '서울시 강우량 정보',         purpose: '10분 단위 강우량 및 단기 강우 증가율 분석' },
  { name: '서울시 강수량 현황 정보',    purpose: '지역별·기간별 강수 패턴 참고 및 위험도 보조 분석' },
  { name: '서울시 빗물펌프장 공간정보', purpose: '위험지역 인근 배수 대응 인프라 위치 분석' },
];

const PUBLIC_DATA_SOURCES = [
  {
    name: '한국환경공단_공공하수처리시설 현황',
    purpose: '공공하수처리시설 위치 및 처리용량 기반 하수 처리 인프라 참고',
  },
];

const RISK_FACTORS = [
  '최근 강우량 (10분/30분/1시간)',
  '하수관 수위 및 수위 상승률',
  '하수도 용량 대비 수위 비율',
  '과거 침수이력 가중치',
  '빗물펌프장 접근성 및 용량',
  '하수도 시설 노후도 정보',
  '인근 공공하수처리시설 위치 및 처리용량',
  '하수 처리 인프라 접근성',
  '배수·처리 대응 기반 참고',
];

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 text-slate-700 text-sm font-semibold">
      <span className="w-1 h-4 rounded-full bg-blue-600 inline-block" />
      {children}
    </h2>
  );
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [rainfallData, setRainfallData] = useState<RainfallTimeseries[]>([]);
  const [sewerData, setSewerData] = useState<SewerLevelTimeseries[]>([]);
  const [riskZones, setRiskZones] = useState<RiskZone[]>([]);
  const [pumpStations, setPumpStations] = useState<PumpStation[]>([]);
  const [sewageFacilities, setSewageFacilities] = useState<SewageTreatmentFacility[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchAll = useCallback(async () => {
    try {
      const [s, r, sw, rz, ps, sf] = await Promise.all([
        getDashboardSummary(),
        getRainfallTimeseries(),
        getSewerLevelTimeseries(),
        getRiskZones(),
        getPumpStations(),
        getSewageTreatmentFacilities(),
      ]);
      setSummary(s);
      setRainfallData(r);
      setSewerData(sw);
      setRiskZones(rz);
      setPumpStations(ps);
      setSewageFacilities(sf);
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
      {loading ? (
        <div className="flex items-center justify-center h-[80vh]">
          <div className="flex flex-col items-center gap-4 text-slate-400">
            <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm">데이터 로딩 중...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {/* ── KPI 영역 ── */}
          <KpiGrid summary={summary} />

          {/* ── 지도 + 상황 패널 ── */}
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
            <div className="xl:col-span-3 flex flex-col gap-2">
              <SectionTitle>서울시 위험 구간 현황</SectionTitle>
              <div style={{ height: '520px' }}>
                <SeoulRiskMap
                  riskZones={riskZones}
                  pumpStations={pumpStations}
                  sewageFacilities={sewageFacilities}
                />
              </div>
            </div>

            <div className="xl:col-span-2 flex flex-col gap-2">
              <SectionTitle>실시간 상황 패널</SectionTitle>
              <div className="flex-1" style={{ height: '520px' }}>
                <AlertPanel zones={riskZones} />
              </div>
            </div>
          </div>

          {/* ── 시계열 분석 차트 ── */}
          <div className="space-y-2">
            <SectionTitle>시계열 분석</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <RainfallChart data={rainfallData} />
              <SewerLevelChart data={sewerData} />
              <RiskTrendChart zones={riskZones} />
            </div>
          </div>

          {/* ── 데이터 출처 및 위험도 산정 기준 ── */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            {/* 섹션 헤더 */}
            <div className="flex items-center gap-2 mb-5">
              <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-slate-700 text-sm font-semibold">데이터 출처 및 위험도 산정 기준</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
              {/* 카드 1: 서울 열린데이터광장 */}
              <div className="lg:col-span-1 rounded-lg border border-blue-100 bg-blue-50/50 p-4">
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
                <ul className="space-y-2.5">
                  {SEOUL_DATA_SOURCES.map((src) => (
                    <li key={src.name}>
                      <p className="text-slate-700 text-xs font-semibold leading-snug">{src.name}</p>
                      <p className="text-slate-500 text-[11px] mt-0.5 leading-snug">{src.purpose}</p>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 카드 2: 공공데이터포털 (공공하수처리시설 현황) */}
              <div className="lg:col-span-1 rounded-lg border border-teal-100 bg-teal-50/50 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-md bg-teal-600 flex items-center justify-center flex-shrink-0">
                    {/* 환경 인프라 시설 아이콘 */}
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-teal-800 text-xs font-bold leading-tight">공공데이터포털</p>
                    <p className="text-teal-500 text-[10px]">data.go.kr · 한국환경공단</p>
                  </div>
                </div>
                <ul className="space-y-2.5">
                  {PUBLIC_DATA_SOURCES.map((src) => (
                    <li key={src.name}>
                      <div className="flex items-start gap-1.5 mb-1">
                        {/* 하수처리시설 관련 아이콘 */}
                        <svg className="w-3.5 h-3.5 text-teal-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-slate-700 text-xs font-semibold leading-snug">{src.name}</p>
                      </div>
                      <p className="text-slate-500 text-[11px] ml-5 leading-snug">{src.purpose}</p>
                      <div className="flex flex-wrap gap-1 mt-2 ml-5">
                        {['하수처리시설', '처리용량', '환경인프라', '대응시설 참고'].map((tag) => (
                          <span
                            key={tag}
                            className="px-1.5 py-0.5 rounded text-[10px] bg-teal-100 text-teal-700 border border-teal-200 font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="mt-3 pt-3 border-t border-teal-100 flex items-center gap-1.5 text-[11px] text-teal-600">
                  <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  지도에서 <strong className="mx-0.5">공공하수처리시설</strong> 레이어를 켜서 위치를 확인할 수 있습니다.
                </div>
              </div>

              {/* 카드 3: 위험도 산정 요소 */}
              <div className="lg:col-span-1 rounded-lg border border-slate-200 bg-slate-50/60 p-4">
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
                      <span className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold flex-shrink-0
                        ${i >= 6 ? 'bg-teal-100 text-teal-700' : 'bg-blue-100 text-blue-600'}`}>
                        {i + 1}
                      </span>
                      <span className={`leading-snug ${i >= 6 ? 'text-teal-700 font-medium' : 'text-slate-600'}`}>
                        {factor}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 하단 설명 문구 */}
            <div className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-slate-500">
              <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                본 위험도는 강우량, 하수관 수위, 하천 수위, 빗물펌프장 접근성,{' '}
                <strong className="text-teal-600">공공하수처리시설 현황</strong> 등 도시 배수·처리 인프라 정보를 종합적으로 참고하여 표시됩니다.
                <span className="text-slate-400 ml-1.5">※ 위험도 계산은 백엔드에서 수행하며, 프론트엔드는 결과를 시각화합니다.</span>
              </span>
              <span className="ml-auto text-slate-400">위험도 산정 알고리즘 ver 1.1 · 데이터 갱신주기 1분</span>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
