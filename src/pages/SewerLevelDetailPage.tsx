import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Header from '../components/layout/Header';
import PageTitle, { SectionTitle } from '../components/common/PageTitle';
import DetailSummaryCard from '../components/common/DetailSummaryCard';
import SewerLevelChart from '../components/charts/SewerLevelChart';
import SewerLevelDetailChart from '../components/charts/SewerLevelDetailChart';
import SewerSensorTable from '../components/tables/SewerSensorTable';

import type { DashboardSummary } from '../types/dashboard';
import type { SewerGuRiskItem, SewerLevelTimeseries, SewerSensor } from '../types/sewer';
import { getDashboardSummary } from '../api/dashboardApi';
import { getSewerGuRiskTop10, getSewerLevelTimeseries, getSewerSensors } from '../api/sewerLevelApi';
import { formatDateTime } from '../utils/format';

function Spinner() {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="flex flex-col items-center gap-4 text-slate-400">
        <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm">데이터 로딩 중...</p>
      </div>
    </div>
  );
}

export default function SewerLevelDetailPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [timeseries, setTimeseries] = useState<SewerLevelTimeseries[]>([]);
  const [sensors, setSensors] = useState<SewerSensor[]>([]);
  const [guRiskTop10, setGuRiskTop10] = useState<SewerGuRiskItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getDashboardSummary().then(setSummary).catch(() => {}),
      getSewerLevelTimeseries().then(setTimeseries).catch(() => {}),
      getSewerSensors().then(setSensors).catch(() => {}),
      getSewerGuRiskTop10().then(setGuRiskTop10).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <DashboardLayout header={<Header summary={null} showBackButton />}>
        <Spinner />
      </DashboardLayout>
    );
  }

  if (!summary) {
    return (
      <DashboardLayout header={<Header summary={null} showBackButton />}>
        <div className="flex items-center justify-center h-[60vh] text-slate-400 text-sm">
          데이터를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.
        </div>
      </DashboardLayout>
    );
  }

  const latestTimeseriesAvg = timeseries.length > 0 ? timeseries[timeseries.length - 1].waterLevelM : 0;
  const maxSensor = sensors.length > 0 ? [...sensors].sort((a, b) => b.waterLevelM - a.waterLevelM)[0] : null;
  const avgRiseRate = sensors.length > 0 ? sensors.reduce((s, x) => s + x.levelChangeRate, 0) / sensors.length : 0;
  const riskyGuCount = guRiskTop10.filter((g) => g.status === 'WARNING' || g.status === 'DANGER').length;

  return (
    <DashboardLayout header={<Header summary={summary} showBackButton />}>
      <div className="space-y-5">
        <PageTitle
          title="하수관 수위 상세 분석"
          description="하수관 실측 센서(raw/gu) 기준으로 막힘, 역류, 배수 지연 가능성을 모니터링합니다. (종합위험 점수 기준과 별도)"
          updatedAt={formatDateTime(summary.updatedAt)}
          iconBg="bg-cyan-600"
          icon={
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          }
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <DetailSummaryCard
            title="평균 하수관 수위"
            value={latestTimeseriesAvg.toFixed(2)}
            unit="m"
            sub={sensors.length > 0 ? `최신 5분 평균 · 센서 ${sensors.length}개 기준` : '센서 데이터 없음'}
            iconBg="bg-cyan-600"
            accentColor="border-l-cyan-500"
            icon={
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
          />
          <DetailSummaryCard
            title="최고 수위 구역"
            value={maxSensor ? maxSensor.waterLevelM.toFixed(2) : '-'}
            unit={maxSensor ? 'm' : ''}
            sub={maxSensor ? maxSensor.locationName : '데이터 없음'}
            iconBg="bg-red-600"
            accentColor="border-l-red-500"
            highlight={(maxSensor?.waterLevelM ?? 0) >= 2.0}
            icon={
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            }
          />
          <DetailSummaryCard
            title="평균 수위 상승률"
            value={avgRiseRate.toFixed(1)}
            unit="%/hr"
            sub={avgRiseRate > 15 ? '⚠ 빠른 상승 감지' : '정상 범위'}
            iconBg={avgRiseRate > 15 ? 'bg-orange-600' : 'bg-amber-500'}
            accentColor={avgRiseRate > 15 ? 'border-l-orange-500' : 'border-l-amber-400'}
            highlight={avgRiseRate > 25}
            icon={
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
          />
          <DetailSummaryCard
            title="위험 자치구 수"
            value={riskyGuCount}
            unit="개 구"
            sub="TOP10 기준 WARNING·DANGER"
            iconBg={riskyGuCount > 0 ? 'bg-red-600' : 'bg-green-600'}
            accentColor={riskyGuCount > 0 ? 'border-l-red-500' : 'border-l-green-500'}
            highlight={riskyGuCount >= 2}
            icon={
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m-3.536-3.536a4 4 0 010-5.656M9.172 16.172a4 4 0 010-5.656m-3.536 3.536a9 9 0 010-12.728" />
              </svg>
            }
          />
        </div>

        {maxSensor && maxSensor.waterLevelM >= 2.0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
            </svg>
            <div>
              <p className="text-red-800 text-sm font-semibold mb-1">수위 위험 경고</p>
              <p className="text-red-700 text-xs">
                <strong>{maxSensor.locationName}</strong> 수위가 위험 기준선(2.0m)을 초과했습니다.
                현재 {maxSensor.waterLevelM}m로 최대 용량 대비 {maxSensor.capacityRate}%에 달합니다.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <SectionTitle>수위 변화 분석</SectionTitle>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <h3 className="text-slate-700 text-sm font-semibold mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                시간대별 수위 변화 (서울시 평균)
                <span className="ml-auto text-slate-400 text-xs font-normal">위험수위 2.0m</span>
              </h3>
              {timeseries.length > 0 ? (
                <div style={{ height: '240px' }}>
                  <SewerLevelChart data={timeseries} />
                </div>
              ) : (
                <div className="flex items-center justify-center h-[240px] text-slate-400 text-sm">
                  현재 하수관 수위 센서 데이터가 없습니다
                </div>
              )}
            </div>
            {guRiskTop10.length > 0 ? (
              <SewerLevelDetailChart data={guRiskTop10} />
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center justify-center text-slate-400 text-sm" style={{ minHeight: '280px' }}>
                현재 자치구별 위험도 데이터가 없습니다
              </div>
            )}
          </div>
        </div>

        {sensors.length > 0 && (
          <div className="space-y-2">
            <SectionTitle>구별 수위 현황</SectionTitle>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <SewerSensorTable sensors={sensors} />
            </div>
          </div>
        )}

        {sensors.length === 0 && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
            <p className="text-slate-500 text-sm font-medium mb-1">현재 백엔드에서 제공된 하수관 수위 센서 데이터가 없습니다</p>
            <p className="text-slate-400 text-xs">API 연결은 정상이며, 원천 데이터 수집 여부를 확인해야 합니다</p>
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-slate-700 text-sm font-semibold">데이터 해석 안내</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { title: '이 데이터가 의미하는 것', color: 'bg-cyan-500', items: ['실시간 하수관 내 수위 높이', '수위 상승 속도로 배수 지연 판단', '센서 통신 이상 여부 및 현장 데이터 신뢰도'] },
              { title: '위험 판단 근거', color: 'bg-orange-500', items: ['수위 1.5m 이상: 주의 단계 진입', '수위 2.0m 이상: 위험 기준 초과', '상승률 20%/hr 이상: 빠른 침수 가능성'] },
              { title: '대응이 필요한 상황', color: 'bg-red-500', items: ['수위 2.0m 초과 + 강우 지속 시', '2개 이상 센서 동시 위험 수위 도달 시', '통신 불통 센서 현장 긴급 점검 필요 시'] },
            ].map((panel) => (
              <div key={panel.title}>
                <p className="text-slate-700 text-xs font-semibold mb-2 flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${panel.color}`} />
                  {panel.title}
                </p>
                <ul className="space-y-1.5">
                  {panel.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-xs text-slate-500">
                      <span className="text-slate-300 flex-shrink-0 mt-0.5">›</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
