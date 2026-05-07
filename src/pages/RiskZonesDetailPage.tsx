import DashboardLayout from '../components/layout/DashboardLayout';
import Header from '../components/layout/Header';
import PageTitle, { SectionTitle } from '../components/common/PageTitle';
import DetailSummaryCard from '../components/common/DetailSummaryCard';
import SeoulRiskMap from '../components/map/SeoulRiskMap';
import RiskZoneTable from '../components/tables/RiskZoneTable';
import RiskDistributionChart from '../components/charts/RiskDistributionChart';
import RiskReasonChart from '../components/charts/RiskReasonChart';

import { mockDashboardSummary } from '../mocks/dashboardMock';
import { mockRiskZones } from '../mocks/riskZonesMock';
import { mockPumpStations } from '../mocks/mapLayerMock';
import { mockSewageTreatmentFacilities } from '../mocks/sewageTreatmentMock';
import { formatDateTime } from '../utils/format';

const dangerCount = mockRiskZones.filter((z) => z.riskLevel === 'DANGER').length;
const warningCount = mockRiskZones.filter((z) => z.riskLevel === 'WARNING').length;
const cautionCount = mockRiskZones.filter((z) => z.riskLevel === 'CAUTION').length;
const safeCount = mockRiskZones.filter((z) => z.riskLevel === 'SAFE').length;

export default function RiskZonesDetailPage() {
  return (
    <DashboardLayout header={<Header summary={mockDashboardSummary} showBackButton />}>
      <div className="space-y-5">
        {/* Page title */}
        <PageTitle
          title="위험 구간 상세 현황"
          description="강우량, 하수관 수위, 과거 침수이력, 펌프장 접근성을 종합하여 위험구간을 산정합니다."
          updatedAt={formatDateTime(mockDashboardSummary.updatedAt)}
          iconBg="bg-orange-600"
          icon={
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
        />

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <DetailSummaryCard
            title="전체 위험구간"
            value={mockRiskZones.length}
            unit="개소"
            sub="현재 모니터링 중"
            iconBg="bg-blue-700"
            accentColor="border-l-blue-500"
            icon={
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            }
          />
          <DetailSummaryCard
            title="위험 단계"
            value={dangerCount}
            unit="개소"
            sub="즉각 대응 필요"
            iconBg="bg-red-600"
            accentColor="border-l-red-500"
            highlight={dangerCount > 0}
            icon={
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
              </svg>
            }
          />
          <DetailSummaryCard
            title="경계 단계"
            value={warningCount}
            unit="개소"
            sub="상황 모니터링 중"
            iconBg="bg-orange-600"
            accentColor="border-l-orange-500"
            icon={
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            }
          />
          <DetailSummaryCard
            title="주의 단계"
            value={cautionCount}
            unit="개소"
            sub={`안전 ${safeCount}개소 포함`}
            iconBg="bg-yellow-500"
            accentColor="border-l-yellow-400"
            icon={
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            }
          />
        </div>

        {/* Map + zone list */}
        <div className="space-y-2">
          <SectionTitle>서울시 위험 구간 지도</SectionTitle>
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
            <div className="xl:col-span-3" style={{ height: '500px' }}>
              <SeoulRiskMap riskZones={mockRiskZones} pumpStations={mockPumpStations} sewageFacilities={mockSewageTreatmentFacilities} />
            </div>
            <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden" style={{ height: '500px' }}>
              <div className="px-4 py-3 border-b border-slate-100 flex-shrink-0">
                <h3 className="text-slate-700 text-sm font-semibold">위험지역 목록</h3>
                <p className="text-slate-400 text-xs mt-0.5">위험 점수 기준 내림차순</p>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {[...mockRiskZones]
                  .sort((a, b) => b.riskScore - a.riskScore)
                  .map((zone, idx) => (
                    <div key={zone.id} className={`rounded-lg border p-3 ${zone.riskLevel === 'DANGER' ? 'bg-red-50 border-red-200' : zone.riskLevel === 'WARNING' ? 'bg-orange-50 border-orange-200' : zone.riskLevel === 'CAUTION' ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-slate-200'}`}>
                      <div className="flex items-start justify-between mb-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-slate-400 text-xs font-bold w-4">{idx + 1}</span>
                          <div className="min-w-0">
                            <p className="text-slate-800 text-sm font-semibold truncate">{zone.name}</p>
                            <p className="text-slate-500 text-xs">{zone.district}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                          <span className={`text-xs font-bold ${zone.riskLevel === 'DANGER' ? 'text-red-600' : zone.riskLevel === 'WARNING' ? 'text-orange-600' : zone.riskLevel === 'CAUTION' ? 'text-yellow-600' : 'text-green-600'}`}>
                            {zone.riskLevel === 'DANGER' ? '위험' : zone.riskLevel === 'WARNING' ? '경계' : zone.riskLevel === 'CAUTION' ? '주의' : '안전'}
                          </span>
                          <span className="text-slate-400 text-xs">{zone.riskScore}점</span>
                        </div>
                      </div>
                      <div className="flex gap-3 text-xs text-slate-400">
                        <span>강우 <span className="text-slate-600 font-medium">{zone.metrics.rainfallMm}mm</span></span>
                        <span>수위 <span className="text-slate-600 font-medium">{zone.metrics.sewerLevelM}m</span></span>
                        <span>용량 <span className="text-slate-600 font-medium">{zone.metrics.sewerCapacityRate}%</span></span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Charts row */}
        <div className="space-y-2">
          <SectionTitle>위험도 분석 차트</SectionTitle>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <RiskDistributionChart zones={mockRiskZones} />
            <RiskReasonChart zones={mockRiskZones} />
          </div>
        </div>

        {/* Full table */}
        <div className="space-y-2">
          <SectionTitle>위험 구간 상세 테이블</SectionTitle>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <RiskZoneTable zones={mockRiskZones} />
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
                color: 'bg-blue-500',
                items: ['위험도 점수 0~100점 산정 결과', '강우량·수위·이력·펌프장 접근성 종합', '위험 단계별 대응 수준 차등화'],
              },
              {
                title: '위험 판단 근거',
                color: 'bg-orange-500',
                items: ['점수 70점 이상: 경계(WARNING)', '점수 80점 이상: 위험(DANGER)', '과거 침수이력 있는 구간 가중 산정'],
              },
              {
                title: '대응이 필요한 상황',
                color: 'bg-red-500',
                items: ['DANGER 구간 2개소 이상 동시 발생 시', 'WARNING 구간 주변 추가 모니터링 필요', 'CAUTION 구간 강우 지속 시 재평가'],
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
