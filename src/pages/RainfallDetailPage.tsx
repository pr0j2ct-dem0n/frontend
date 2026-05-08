import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Header from '../components/layout/Header';
import PageTitle, { SectionTitle } from '../components/common/PageTitle';
import DetailSummaryCard from '../components/common/DetailSummaryCard';
import RainfallChart from '../components/charts/RainfallChart';
import RainfallDetailChart from '../components/charts/RainfallDetailChart';

import type { DashboardSummary } from '../types/dashboard';
import type { RainfallTimeseries } from '../types/rainfall';
import type { DistrictRainfall } from '../types/rainfall';
import type { RiskLevel } from '../types/dashboard';
import { getDashboardSummary } from '../api/dashboardApi';
import { getRainfallTimeseries } from '../api/rainfallApi';
import apiClient from '../api/client';
import type { RainfallGuItem } from '../api/backendTypes';
import { RISK_LABELS, RISK_COLORS } from '../utils/riskStyle';
import { formatDateTime } from '../utils/format';

function rainfallToRiskLevel(mm10: number): RiskLevel {
  if (mm10 >= 15) return 'DANGER';
  if (mm10 >= 10) return 'WARNING';
  if (mm10 >= 5) return 'CAUTION';
  return 'SAFE';
}

function mapToDistrictRainfall(items: RainfallGuItem[]): DistrictRainfall[] {
  return items.map((item) => ({
    district: item.gu,
    stationName: item.gu + ' 관측소',
    rainfall10Min: Math.round(item.rainfall_avg_10min * 10) / 10,
    rainfall30Min: Math.round(item.rainfall_avg_10min * 2.5 * 10) / 10,
    rainfall1Hour: Math.round(item.rainfall_avg_10min * 6 * 10) / 10,
    riskLevel: rainfallToRiskLevel(item.rainfall_avg_10min),
  }));
}

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

export default function RainfallDetailPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [timeseries, setTimeseries] = useState<RainfallTimeseries[]>([]);
  const [districtRainfall, setDistrictRainfall] = useState<DistrictRainfall[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getDashboardSummary().then(setSummary).catch(() => {}),
      getRainfallTimeseries().then(setTimeseries).catch(() => {}),
      apiClient
        .get<RainfallGuItem[]>('/rainfall/gu')
        .then((res) => {
          if (res.data.length > 0) setDistrictRainfall(mapToDistrictRainfall(res.data));
        })
        .catch(() => {}),
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

  const current = timeseries[timeseries.length - 1];
  const surgeDistricts = districtRainfall.filter((d) => d.rainfall10Min >= 10);

  return (
    <DashboardLayout header={<Header summary={summary} showBackButton />}>
      <div className="space-y-5">
        <PageTitle
          title="실시간 강우량 상세 분석"
          description="최근 강우량 변화와 지역별 강수 집중도를 분석하여 하수도 막힘 및 역류 위험 가능성을 판단합니다."
          updatedAt={formatDateTime(summary.updatedAt)}
          iconBg="bg-blue-700"
          icon={
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
          }
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <DetailSummaryCard
            title="현재 강우량 (10분)"
            value={current ? current.rainfall10MinMm.toFixed(1) : '0.0'}
            unit="mm"
            sub="서울시 평균"
            iconBg="bg-blue-700"
            accentColor="border-l-blue-500"
            highlight={(current?.rainfall10MinMm ?? 0) >= 15}
            icon={
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
            }
          />
          <DetailSummaryCard
            title="30분 누적 강우량"
            value={current ? current.rainfall30MinMm.toFixed(1) : '0.0'}
            unit="mm"
            sub="기준 초과 시 경보"
            iconBg="bg-sky-600"
            accentColor="border-l-sky-500"
            icon={
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <DetailSummaryCard
            title="1시간 누적 강우량"
            value={current ? current.rainfall1HourMm.toFixed(1) : '0.0'}
            unit="mm"
            sub={(current?.rainfall1HourMm ?? 0) >= 50 ? '⚠ 위험 강우 기준 초과' : '정상 범위'}
            iconBg={(current?.rainfall1HourMm ?? 0) >= 50 ? 'bg-red-600' : 'bg-indigo-600'}
            accentColor={(current?.rainfall1HourMm ?? 0) >= 50 ? 'border-l-red-500' : 'border-l-indigo-500'}
            highlight={(current?.rainfall1HourMm ?? 0) >= 50}
            icon={
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }
          />
          <DetailSummaryCard
            title="강우 급증 지역 수"
            value={surgeDistricts.length}
            unit="개구"
            sub="10분 강우량 10mm 이상"
            iconBg={surgeDistricts.length >= 3 ? 'bg-orange-600' : 'bg-amber-500'}
            accentColor={surgeDistricts.length >= 3 ? 'border-l-orange-500' : 'border-l-amber-400'}
            highlight={surgeDistricts.length >= 5}
            icon={
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            }
          />
        </div>

        {surgeDistricts.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
            </svg>
            <div>
              <p className="text-orange-800 text-sm font-semibold mb-1">강우 급증 경고</p>
              <p className="text-orange-700 text-xs">
                {surgeDistricts.map((d) => d.district).join(', ')} 등 {surgeDistricts.length}개 구에서 10분 강우량 10mm 이상이 감지되었습니다.
                하수관 수위 상승 및 역류 위험이 높아질 수 있습니다.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <SectionTitle>시계열 분석 및 지역별 현황</SectionTitle>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <h3 className="text-slate-700 text-sm font-semibold mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                시간대별 강우량 추이
              </h3>
              <div style={{ height: '240px' }}>
                <RainfallChart data={timeseries} />
              </div>
            </div>
            <RainfallDetailChart data={districtRainfall} />
          </div>
        </div>

        {districtRainfall.length > 0 && (
          <div className="space-y-2">
            <SectionTitle>지역별 강우량 순위</SectionTitle>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left py-2.5 px-4 text-slate-500 text-xs font-semibold">순위</th>
                      <th className="text-left py-2.5 px-4 text-slate-500 text-xs font-semibold">행정구</th>
                      <th className="text-left py-2.5 px-4 text-slate-500 text-xs font-semibold">관측소</th>
                      <th className="text-right py-2.5 px-4 text-slate-500 text-xs font-semibold">10분 (mm)</th>
                      <th className="text-right py-2.5 px-4 text-slate-500 text-xs font-semibold">30분 (mm)</th>
                      <th className="text-right py-2.5 px-4 text-slate-500 text-xs font-semibold">1시간 (mm)</th>
                      <th className="text-center py-2.5 px-4 text-slate-500 text-xs font-semibold">위험도</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...districtRainfall]
                      .sort((a, b) => b.rainfall10Min - a.rainfall10Min)
                      .map((d, idx) => (
                        <tr key={d.district} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="py-2.5 px-4 text-slate-400 text-xs font-bold">{idx + 1}</td>
                          <td className="py-2.5 px-4 text-slate-800 font-medium">{d.district}</td>
                          <td className="py-2.5 px-4 text-slate-500 text-xs">{d.stationName}</td>
                          <td className="py-2.5 px-4 text-right font-bold text-slate-800">{d.rainfall10Min.toFixed(1)}</td>
                          <td className="py-2.5 px-4 text-right text-slate-600">{d.rainfall30Min.toFixed(1)}</td>
                          <td className="py-2.5 px-4 text-right text-slate-600">{d.rainfall1Hour.toFixed(1)}</td>
                          <td className="py-2.5 px-4 text-center">
                            <span
                              className="inline-block px-2 py-0.5 rounded-full text-xs font-bold text-white"
                              style={{ backgroundColor: RISK_COLORS[d.riskLevel] }}
                            >
                              {RISK_LABELS[d.riskLevel]}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
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
              { title: '이 데이터가 의미하는 것', color: 'bg-blue-500', items: ['지역별 강우 집중도 및 분포 현황', '10분/30분/1시간 누적 강우량 비교', '강우 강도가 높은 구역 위험 가능성'] },
              { title: '위험 판단 근거', color: 'bg-orange-500', items: ['10분 강우량 15mm 이상: 경보 기준', '1시간 강우량 50mm 이상: 위험 기준', '복수 구역 동시 강우 급증: 광역 대응 필요'] },
              { title: '대응이 필요한 상황', color: 'bg-red-500', items: ['1시간 강우량 75mm 초과 지속 시', '2개 이상 구역 동시 위험 강우 발생 시', '강우 강도 급증 + 하수관 수위 상승 동반 시'] },
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
