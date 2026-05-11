import type { DashboardSummary } from '../../types/dashboard';
import KpiCard from './KpiCard';
import StatusBadge from '../common/StatusBadge';
import { formatNumber, formatChangeRate } from '../../utils/format';

interface KpiGridProps {
  summary: DashboardSummary | null;
}

export default function KpiGrid({ summary }: KpiGridProps) {
  if (!summary) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl bg-white border border-slate-200 h-36 animate-pulse shadow-sm" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard
        title="현재 강우량 (10분)"
        value={formatNumber(summary.currentRainfallMm)}
        unit="mm"
        subValue={`전시간 대비 ${formatChangeRate(summary.rainfallChangeRate)}`}
        trend={summary.rainfallChangeRate > 0 ? 'up' : 'down'}
        iconBg="bg-blue-700"
        accentColor="border-l-blue-500"
        to="/rainfall"
        icon={
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
        }
      />

      <KpiCard
        title="평균 하수관 수위"
        value={formatNumber(summary.averageSewerLevelM, 2)}
        unit="m"
        subValue={`변화율 ${formatChangeRate(summary.averageSewerLevelChangeRate)}`}
        trend={summary.averageSewerLevelChangeRate > 0 ? 'up' : 'down'}
        iconBg="bg-cyan-600"
        accentColor="border-l-cyan-500"
        to="/sewer-level"
        icon={
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        }
      />

      <KpiCard
        title="위험 구간 수"
        value={summary.riskZoneCount}
        unit="개소"
        subValue="현재 모니터링 중"
        iconBg={summary.riskZoneCount >= 5 ? 'bg-orange-600' : 'bg-amber-500'}
        accentColor={summary.riskZoneCount >= 5 ? 'border-l-orange-500' : 'border-l-amber-400'}
        highlight={summary.riskZoneCount >= 7}
        to="/risk-zones"
        icon={
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        }
      />

      <KpiCard
        title="최고 위험 지역"
        value={summary.highestRiskArea}
        subValue="종합위험 기준 (강우·수위·이력·구조)"
        highlight={summary.highestRiskLevel === 'DANGER'}
        iconBg="bg-red-600"
        accentColor="border-l-red-500"
        to={`/highest-risk-area?gu=${encodeURIComponent(summary.highestRiskArea)}`}
        badge={<StatusBadge level={summary.highestRiskLevel} size="sm" pulse />}
        icon={
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"  />
          </svg>
        }
      />
    </div>
  );
}
