import DashboardLayout from '../components/layout/DashboardLayout';
import Header from '../components/layout/Header';
import PageTitle, { SectionTitle } from '../components/common/PageTitle';
import DetailRiskMap from '../components/map/DetailRiskMap';
import RainfallChart from '../components/charts/RainfallChart';
import SewerLevelChart from '../components/charts/SewerLevelChart';

import { mockDashboardSummary } from '../mocks/dashboardMock';
import { mockRiskZones } from '../mocks/riskZonesMock';
import { mockPumpStations, mockFloodHistory } from '../mocks/mapLayerMock';
import { mockSewageTreatmentFacilities } from '../mocks/sewageTreatmentMock';
import { mockRainfallTimeseries } from '../mocks/rainfallMock';
import { mockSewerLevelTimeseries } from '../mocks/sewerLevelMock';
import { RISK_LABELS } from '../utils/riskStyle';
import { formatDateTime } from '../utils/format';

const sortedZones = [...mockRiskZones].sort((a, b) => b.riskScore - a.riskScore);
const topZone = sortedZones[0];
const nearbyPump = mockPumpStations.find((p) => p.district === topZone.district) ?? mockPumpStations[0];
const floodHistory = mockFloodHistory.find((f) => f.name === topZone.name) ?? mockFloodHistory[0];
const nearbySewage =
  mockSewageTreatmentFacilities.find((f) => f.district === topZone.district) ??
  mockSewageTreatmentFacilities[0];

const RISK_CAUSES = [
  { label: '최근 1시간 강우량 급증', value: `${topZone.metrics.rainfallMm}mm`, severity: 'high' },
  { label: '하수관 수위 상승률 과다', value: '+37.1%/hr', severity: 'high' },
  { label: '하수도 용량 대비 수위', value: `${topZone.metrics.sewerCapacityRate}% 사용`, severity: 'high' },
  { label: '과거 침수이력 존재', value: `5년 내 ${floodHistory.floodCount5Year}회`, severity: 'medium' },
  { label: '인근 펌프장 거리', value: '약 1.2km', severity: 'medium' },
  { label: '배수 인프라 노후도', value: '20년 이상 구간', severity: 'low' },
];

const SEVERITY_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  high: { bg: 'bg-red-50 border-red-200', text: 'text-red-700', dot: 'bg-red-500' },
  medium: { bg: 'bg-orange-50 border-orange-200', text: 'text-orange-700', dot: 'bg-orange-400' },
  low: { bg: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-700', dot: 'bg-yellow-400' },
};

const RECOMMENDATIONS = [
  { icon: '🚨', title: '즉각 현장 점검', desc: '논현동 저지대 하수관 현장 점검 및 준설 작업 시행' },
  { icon: '🚧', title: '차량 통제 준비', desc: '침수 위험 구간 내 지하차도 및 저지대 도로 사전 통제 검토' },
  { icon: '💧', title: '펌프장 가동 확인', desc: '강남빗물펌프장 정상 가동 여부 및 용량 확인' },
  { icon: '📡', title: '주민 사전 알림', desc: '인근 주민 대상 침수 위험 예보 문자 발송 준비' },
];

export default function HighestRiskAreaDetailPage() {
  return (
    <DashboardLayout header={<Header summary={mockDashboardSummary} showBackButton />}>
      <div className="space-y-5">
        {/* Page title */}
        <PageTitle
          title="최고 위험 지역 상세 분석"
          description="현재 가장 높은 위험도를 보이는 지역의 원인과 대응 필요성을 상세히 분석합니다."
          updatedAt={formatDateTime(mockDashboardSummary.updatedAt)}
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
          {/* Zoomed map */}
          <div className="xl:col-span-3 space-y-2">
            <SectionTitle>현장 위치 지도</SectionTitle>
            <DetailRiskMap
              riskZones={mockRiskZones}
              pumpStations={mockPumpStations}
              center={[topZone.latitude, topZone.longitude]}
              zoom={14}
              height="420px"
              highlightZoneId={topZone.id}
            />
          </div>

          {/* Cause analysis */}
          <div className="xl:col-span-2 space-y-2">
            <SectionTitle>위험 원인 분석</SectionTitle>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-2.5">
              {RISK_CAUSES.map((cause) => {
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

            {/* Pump station info */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <p className="text-slate-600 text-xs font-semibold mb-3 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                인근 빗물펌프장
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">펌프장명</span>
                  <span className="text-slate-800 font-semibold">{nearbyPump.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">방류 하천</span>
                  <span className="text-slate-700">{nearbyPump.riverName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">처리 용량</span>
                  <span className="text-slate-700">{nearbyPump.capacity.toLocaleString()} m³/hr</span>
                </div>
              </div>
            </div>

            {/* Flood history */}
            <div className={`rounded-xl border shadow-sm p-4 ${floodHistory.floodCount5Year > 0 ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'}`}>
              <p className={`text-xs font-semibold mb-2 flex items-center gap-1.5 ${floodHistory.floodCount5Year > 0 ? 'text-orange-700' : 'text-green-700'}`}>
                <span className={`w-2 h-2 rounded-full ${floodHistory.floodCount5Year > 0 ? 'bg-orange-500' : 'bg-green-500'}`} />
                과거 침수이력
              </p>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">최근 침수일</span>
                  <span className="text-slate-800 font-semibold">{floodHistory.lastFloodDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">5년 내 발생 횟수</span>
                  <span className={`font-bold ${floodHistory.floodCount5Year >= 3 ? 'text-red-600' : 'text-orange-600'}`}>
                    {floodHistory.floodCount5Year}회
                  </span>
                </div>
              </div>
            </div>

            {/* 인근 공공하수처리시설 현황 */}
            <div className="rounded-xl border border-teal-200 bg-teal-50/60 shadow-sm p-4">
              <p className="text-xs font-semibold mb-2 flex items-center gap-1.5 text-teal-700">
                <span className="w-2 h-2 rounded-sm bg-teal-500" />
                인근 공공하수처리시설 현황
              </p>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">시설명</span>
                  <span className="text-slate-800 font-semibold">{nearbySewage.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">소재지</span>
                  <span className="text-slate-700">{nearbySewage.district}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">처리용량</span>
                  <span className="text-slate-700">{nearbySewage.capacityM3PerDay.toLocaleString()}㎥/일</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">처리방식</span>
                  <span className="text-slate-700 text-right max-w-[140px] leading-snug">{nearbySewage.treatmentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">운영상태</span>
                  <span className={`font-semibold ${nearbySewage.operationStatus === '운영중' ? 'text-teal-600' : 'text-slate-500'}`}>
                    {nearbySewage.operationStatus}
                  </span>
                </div>
              </div>
              <p className="mt-2.5 pt-2 border-t border-teal-200 text-[10px] text-teal-600 leading-snug">
                위험지역 주변의 공공하수처리시설 현황을 참고하여 하수 처리 인프라와 대응 여건을 함께 검토합니다.
              </p>
              <p className="mt-1 text-[10px] text-slate-400">출처: 공공데이터포털 · 한국환경공단_공공하수처리시설 현황</p>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="space-y-2">
          <SectionTitle>시계열 분석 (해당 지역)</SectionTitle>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <h3 className="text-slate-700 text-sm font-semibold mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                최근 강우량 변화
              </h3>
              <div style={{ height: '220px' }}>
                <RainfallChart data={mockRainfallTimeseries} />
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <h3 className="text-slate-700 text-sm font-semibold mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                최근 하수관 수위 변화
                <span className="ml-auto text-slate-400 text-xs font-normal">위험수위 2.0m</span>
              </h3>
              <div style={{ height: '220px' }}>
                <SewerLevelChart data={mockSewerLevelTimeseries} />
              </div>
            </div>
          </div>
        </div>

        {/* Response recommendations */}
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

        {/* Data interpretation */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-slate-700 text-sm font-semibold">데이터 해석 안내</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                title: '이 데이터가 의미하는 것',
                color: 'bg-red-500',
                items: ['복합 위험 요소가 동시에 발생한 지역', '과거 침수이력과 현재 강우가 중첩된 상황', '빗물펌프장 용량 대비 유입량 비교 필요'],
              },
              {
                title: '위험 판단 근거',
                color: 'bg-orange-500',
                items: ['위험점수 80점 이상 + 침수이력 보유', '하수관 용량 90% 이상 사용 중', '펌프장 접근성 1.2km 이상으로 지연 가능'],
              },
              {
                title: '대응이 필요한 상황',
                color: 'bg-slate-500',
                items: ['강우가 30분 이상 지속될 때', '수위가 2.1m를 초과할 경우', '펌프장 가동 용량이 유입량에 미달할 때'],
              },
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
