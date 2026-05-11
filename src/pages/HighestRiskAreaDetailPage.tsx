import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import Header from '../components/layout/Header';
import PageTitle, { SectionTitle } from '../components/common/PageTitle';
import DetailRiskMap from '../components/map/DetailRiskMap';
import RainfallChart from '../components/charts/RainfallChart';
import SewerLevelChart from '../components/charts/SewerLevelChart';

import type { DashboardSummary } from '../types/dashboard';
import type { RiskZone } from '../types/risk';
import type { RainfallTimeseries } from '../types/rainfall';
import type { SewerLevelTimeseries } from '../types/sewer';
import { getDashboardSummary } from '../api/dashboardApi';
import { getRiskZones } from '../api/riskApi';
import { getRainfallTimeseries } from '../api/rainfallApi';
import { getSewerLevelTimeseries } from '../api/sewerLevelApi';
import { getSewerGuRisks } from '../api/sewerLevelApi';
import { getFloodHistoryItems, getFloodCountForDistrict } from '../api/floodHistoryApi';
import type { FloodHistoryGuItem } from '../api/backendTypes';
import { RISK_LABELS } from '../utils/riskStyle';
import { getGuCoords } from '../utils/guCoordinates';
import { formatDateTime } from '../utils/format';

const SEVERITY_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  high: { bg: 'bg-red-50 border-red-200', text: 'text-red-700', dot: 'bg-red-500' },
  medium: { bg: 'bg-orange-50 border-orange-200', text: 'text-orange-700', dot: 'bg-orange-400' },
  low: { bg: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-700', dot: 'bg-yellow-400' },
};

const RECOMMENDATIONS = [
  { icon: '🚨', title: '즉각 현장 점검', desc: '해당 구 저지대 하수관 현장 점검 및 준설 작업 시행' },
  { icon: '🚧', title: '차량 통제 준비', desc: '침수 위험 구간 내 지하차도 및 저지대 도로 사전 통제 검토' },
  { icon: '💧', title: '펌프장 가동 확인', desc: '인근 빗물펌프장 정상 가동 여부 및 용량 확인' },
  { icon: '📡', title: '주민 사전 알림', desc: '인근 주민 대상 침수 위험 예보 문자 발송 준비' },
];

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

export default function HighestRiskAreaDetailPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [riskZones, setRiskZones] = useState<RiskZone[]>([]);
  const [selectedZone, setSelectedZone] = useState<RiskZone | null>(null);
  const [rainfallTimeseries, setRainfallTimeseries] = useState<RainfallTimeseries[]>([]);
  const [sewerTimeseries, setSewerTimeseries] = useState<SewerLevelTimeseries[]>([]);
  const [floodHistory, setFloodHistory] = useState<FloodHistoryGuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    async function load() {
      try {
        const [summaryRes, zonesRes, rainRes, sewerTsRes, floodRes] = await Promise.all([
          getDashboardSummary().catch(() => null),
          getRiskZones().catch(() => [] as RiskZone[]),
          getRainfallTimeseries().catch(() => [] as RainfallTimeseries[]),
          getSewerLevelTimeseries().catch(() => [] as SewerLevelTimeseries[]),
          getFloodHistoryItems().catch(() => [] as FloodHistoryGuItem[]),
        ]);

        setSummary(summaryRes as DashboardSummary | null);
        setRiskZones(zonesRes as RiskZone[]);
        setRainfallTimeseries(rainRes as RainfallTimeseries[]);
        setSewerTimeseries(sewerTsRes as SewerLevelTimeseries[]);
        setFloodHistory(floodRes as FloodHistoryGuItem[]);

        const guParam = searchParams.get('gu');

        // helper to map sewer-gu risk item into RiskZone-like object
        function mapSewerGuToZone(item: any, idx = 0): RiskZone {
          const coords = getGuCoords(item.guName || item.gu_name || item.gu ?? '');
          const avgLevel = item.avgWaterLevel ?? item.avg_water_level ?? 0;
          const maxCapacity = item.maxCapacity ?? item.max_capacity ?? 2.0;
          const capacityRate = Math.round((avgLevel / maxCapacity) * 100);
          const riskScore = Math.round(item.totalRisk ?? 0);
          const status = (item.status ?? '').toString().toUpperCase();
          const riskLevel = status === 'DANGER' ? 'DANGER' : status === 'WARNING' ? 'WARNING' : status === 'CAUTION' ? 'CAUTION' : 'SAFE';
          return {
            id: `GU-${String(idx + 1).padStart(3, '0')}`,
            name: item.guName ?? item.gu_name ?? item.gu ?? '알수없음',
            district: item.guName ?? item.gu_name ?? item.gu ?? '알수없음',
            latitude: coords.lat,
            longitude: coords.lng,
            riskScore,
            riskLevel,
            reasons: [],
            metrics: {
              rainfallMm: Math.round((item.rainfall ?? 0) * 100) / 100,
              sewerLevelM: Math.round(avgLevel * 100) / 100,
              sewerCapacityRate: Math.max(0, Math.min(100, capacityRate)),
            },
          } as RiskZone;
        }

        // Decide which zone to display
        let chosen: RiskZone | null = null;

        if (guParam) {
          chosen = (zonesRes as RiskZone[]).find((z) => z.name === guParam || z.district === guParam) ?? null;
          if (!chosen) {
            const sewerGu = await getSewerGuRisks().catch(() => [] as any[]);
            const matched = sewerGu.find((s: any) => s.guName === guParam || s.gu_name === guParam || s.gu === guParam);
            if (matched) chosen = mapSewerGuToZone(matched, 0);
          }
        } else {
          const sewerGu = await getSewerGuRisks().catch(() => [] as any[]);
          if (sewerGu && sewerGu.length > 0) {
            const top = [...sewerGu].sort((a, b) => (b.totalRisk ?? 0) - (a.totalRisk ?? 0))[0];
            chosen = (zonesRes as RiskZone[]).find((z) => z.name === top.guName || z.district === top.guName) ?? mapSewerGuToZone(top, 0);
          } else {
            // fallback to predict-based top
            const sorted = [...(zonesRes as RiskZone[])].sort((a, b) => b.riskScore - a.riskScore);
            chosen = sorted[0] ?? null;
          }
        }

        setSelectedZone(chosen);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [searchParams]);

  if (loading) {
    return (
      <DashboardLayout header={<Header summary={null} showBackButton />}>
        <Spinner />
      </DashboardLayout>
    );
  }

  if (!summary || !selectedZone) {
    return (
      <DashboardLayout header={<Header summary={summary} showBackButton />}>
        <div className="flex items-center justify-center h-[60vh] text-slate-400 text-sm">
          데이터를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.
        </div>
      </DashboardLayout>
    );
  }

  const topZone = selectedZone as RiskZone;
  const districtFloodCount = getFloodCountForDistrict(floodHistory, topZone.district);

  const riskCauses = [
    { label: '최근 강우량', value: `${topZone.metrics.rainfallMm}mm`, severity: 'high' },
    { label: '하수도 용량 대비 수위', value: `${topZone.metrics.sewerCapacityRate}% 사용`, severity: 'high' },
    { label: '하수관 추정 수위', value: `${topZone.metrics.sewerLevelM}m`, severity: 'high' },
    { label: '과거 침수 발생 건수', value: districtFloodCount > 0 ? `${districtFloodCount}건` : '기록 없음', severity: 'medium' },
    { label: '위험 점수', value: `${topZone.riskScore}점`, severity: 'low' },
  ];

  return (
    <DashboardLayout header={<Header summary={summary} showBackButton />}>
      <div className="space-y-5">
        <PageTitle
          title="최고 위험 지역 상세 분석"
          description="현재 가장 높은 위험도를 보이는 지역의 원인과 대응 필요성을 상세히 분석합니다."
          updatedAt={formatDateTime(summary.updatedAt)}
          iconBg="bg-red-600"
          icon={
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />

        {/* Hero zone banner */}
        <div className="bg-white rounded-xl border-l-4 border-l-red-500 border-t border-r border-b border-red-200 shadow-sm p-5">
          <div className="flex flex-wrap items-start gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-red-500 uppercase tracking-wider">현재 최고 위험 지역</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-500 text-white animate-pulse">
                  {RISK_LABELS[topZone.riskLevel]}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900">{topZone.name}</h2>
              <p className="text-slate-500 text-sm mt-0.5">{topZone.district} · {topZone.id}</p>
            </div>
            <div className="flex gap-6 flex-shrink-0">
              <div className="text-center">
                <p className="text-3xl font-bold text-red-600">{topZone.riskScore}</p>
                <p className="text-slate-500 text-xs mt-0.5">위험 점수</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-slate-800">{topZone.metrics.rainfallMm}</p>
                <p className="text-slate-500 text-xs mt-0.5">강우량(mm)</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-600">{topZone.metrics.sewerLevelM}</p>
                <p className="text-slate-500 text-xs mt-0.5">수위(m)</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-600">{topZone.metrics.sewerCapacityRate}%</p>
                <p className="text-slate-500 text-xs mt-0.5">용량 사용률</p>
              </div>
            </div>
          </div>
        </div>

        {/* Map + Cause analysis */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
          <div className="xl:col-span-3 space-y-2">
            <SectionTitle>현장 위치 지도</SectionTitle>
            <DetailRiskMap
              riskZones={riskZones}
              center={[topZone.latitude, topZone.longitude]}
              zoom={14}
              height="420px"
              highlightZoneId={topZone.id}
            />
          </div>

          <div className="xl:col-span-2 space-y-2">
            <SectionTitle>위험 원인 분석</SectionTitle>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-2.5">
              {riskCauses.map((cause) => {
                const style = SEVERITY_STYLES[cause.severity];
                return (
                  <div key={cause.label} className={`rounded-lg border px-3 py-2.5 ${style.bg} flex items-center justify-between gap-3`}>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${style.dot}`} />
                      <span className="text-slate-700 text-sm font-medium truncate">{cause.label}</span>
                    </div>
                    <span className={`text-xs font-bold flex-shrink-0 ${style.text}`}>{cause.value}</span>
                  </div>
                );
              })}
            </div>

            {topZone.reasons && topZone.reasons.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                <p className="text-slate-600 text-xs font-semibold mb-2 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  AI 위험 판단 근거
                </p>
                <ul className="space-y-1.5">
                  {topZone.reasons.map((reason) => (
                    <li key={reason} className="flex items-start gap-2 text-xs text-slate-600">
                      <span className="text-red-400 flex-shrink-0 mt-0.5">›</span>
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {districtFloodCount > 0 && (
              <div className="rounded-xl border bg-orange-50 border-orange-200 shadow-sm p-4">
                <p className="text-xs font-semibold mb-2 flex items-center gap-1.5 text-orange-700">
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                  과거 침수 이력
                </p>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">누적 침수 발생 건수</span>
                  <span className="font-bold text-orange-700">{districtFloodCount}건</span>
                </div>
                <p className="mt-1 text-[10px] text-slate-400">출처: 서울시 침수흔적도 공공데이터</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <SectionTitle>시계열 분석 (해당 지역)</SectionTitle>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <h3 className="text-slate-700 text-sm font-semibold mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                최근 강우량 변화
              </h3>
              <div style={{ height: '220px' }}>
                <RainfallChart data={rainfallTimeseries} />
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <h3 className="text-slate-700 text-sm font-semibold mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                최근 하수관 수위 변화
                <span className="ml-auto text-slate-400 text-xs font-normal">위험수위 2.0m</span>
              </h3>
              {sewerTimeseries.length > 0 ? (
                <div style={{ height: '220px' }}>
                  <SewerLevelChart data={sewerTimeseries} />
                </div>
              ) : (
                <div className="flex items-center justify-center h-[220px] text-slate-400 text-sm">
                  현재 센서 데이터가 없습니다
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <SectionTitle>대응 권고 사항</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {RECOMMENDATIONS.map((rec) => (
              <div key={rec.title} className="bg-white rounded-xl border border-red-200 shadow-sm p-4">
                <div className="text-2xl mb-2">{rec.icon}</div>
                <p className="text-slate-800 text-sm font-semibold mb-1">{rec.title}</p>
                <p className="text-slate-500 text-xs leading-relaxed">{rec.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
