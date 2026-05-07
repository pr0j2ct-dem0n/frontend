import { useNavigate } from 'react-router-dom';
import type { DashboardSummary } from '../../types/dashboard';
import StatusBadge from '../common/StatusBadge';
import { formatDateTime } from '../../utils/format';

interface HeaderProps {
  summary: DashboardSummary | null;
  lastRefresh?: Date;
  onRefresh?: () => void;
  showBackButton?: boolean;
}

export default function Header({ summary, lastRefresh, onRefresh, showBackButton = false }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 shadow-sm h-[60px] flex items-stretch">
      {/* Blue accent top line */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-800 via-blue-600 to-blue-400" />

      {/* Logo / Service identity */}
      <div className="flex items-center gap-3 px-5 border-r border-slate-100 flex-shrink-0">
        <div className="w-9 h-9 rounded-lg bg-blue-700 flex items-center justify-center flex-shrink-0 shadow-sm">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
        </div>
        <div>
          <h1 className="text-slate-900 font-bold text-sm leading-tight tracking-tight">
            서울시 하수도 막힘 위험 모니터링
          </h1>
          <p className="text-slate-400 text-[11px]">Seoul Sewer Blockage Risk Monitoring System</p>
        </div>
      </div>

      {/* Center: back button or live tag */}
      <div className="flex items-center px-5 flex-1">
        {showBackButton ? (
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 transition-colors px-2.5 py-1 rounded-md hover:bg-blue-50 border border-transparent hover:border-blue-100"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            대시보드로 돌아가기
          </button>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            실시간 하수도 위험 모니터링 상황판
          </span>
        )}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3 px-5 flex-shrink-0">
        {/* Public data badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-100">
          <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
          <span className="text-blue-700 text-xs font-medium">서울시 공공데이터 기반</span>
        </div>

        {/* Data timestamp */}
        {summary && (
          <div className="hidden md:flex items-center gap-1.5 text-slate-500 text-xs border-l border-slate-200 pl-3">
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>기준: </span>
            <span className="text-slate-600 font-mono font-medium">{formatDateTime(summary.updatedAt)}</span>
          </div>
        )}

        {/* Refresh button */}
        {onRefresh && lastRefresh && (
          <button
            onClick={onRefresh}
            className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 transition-colors px-2 py-1 rounded hover:bg-blue-50 border border-transparent hover:border-blue-100"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {lastRefresh.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
          </button>
        )}

        {/* Overall risk status */}
        <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
          <span className="text-slate-500 text-xs font-medium hidden sm:block">전체 상태</span>
          {summary ? (
            <StatusBadge level={summary.overallRiskLevel} size="md" pulse={summary.overallRiskLevel === 'DANGER'} />
          ) : (
            <div className="h-6 w-14 rounded-full bg-slate-200 animate-pulse" />
          )}
        </div>
      </div>
    </header>
  );
}
