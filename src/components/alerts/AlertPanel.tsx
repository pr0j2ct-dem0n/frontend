import { useState } from 'react';
import type { RiskZone } from '../../types/risk';
import AlertItem from './AlertItem';

interface AlertPanelProps {
  zones: RiskZone[];
}

const LEVEL_ORDER = { DANGER: 0, WARNING: 1, CAUTION: 2, SAFE: 3 };
const INITIAL_VISIBLE = 3;

export default function AlertPanel({ zones }: AlertPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const sorted = [...zones].sort(
    (a, b) => LEVEL_ORDER[a.riskLevel] - LEVEL_ORDER[b.riskLevel] || b.riskScore - a.riskScore
  );

  const visibleZones = isExpanded ? sorted : sorted.slice(0, INITIAL_VISIBLE);
  const hiddenCount = sorted.length - INITIAL_VISIBLE;

  const dangerCount = zones.filter((z) => z.riskLevel === 'DANGER').length;
  const warningCount = zones.filter((z) => z.riskLevel === 'WARNING').length;
  const cautionCount = zones.filter((z) => z.riskLevel === 'CAUTION').length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
      {/* Emergency alert banner */}
      {dangerCount > 0 && (
        <div className="bg-red-600 px-4 py-2 flex items-center gap-2 flex-shrink-0">
          <svg className="w-4 h-4 text-white flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
          </svg>
          <span className="text-white text-xs font-semibold">
            긴급 경고 — 위험 구간 {dangerCount}개소 발생
          </span>
          <span className="ml-auto w-2 h-2 rounded-full bg-white animate-ping flex-shrink-0" />
        </div>
      )}

      {/* Panel header */}
      <div className="px-4 pt-4 pb-3 border-b border-slate-100 flex-shrink-0">
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-slate-800 font-semibold text-sm flex items-center gap-2">
            <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            실시간 상황 패널
          </h2>
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-slate-400 text-xs">{zones.length}개소 모니터링</span>
            {sorted.length > INITIAL_VISIBLE && (
              <span className="text-slate-400 text-[10px]">
                {isExpanded ? `전체 ${sorted.length}개 표시 중` : `상위 ${INITIAL_VISIBLE}개 표시 중`}
              </span>
            )}
          </div>
        </div>

        {/* Risk level counts */}
        <div className="flex gap-2 flex-wrap">
          {dangerCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              위험 {dangerCount}
            </span>
          )}
          {warningCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700 border border-orange-200">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
              경계 {warningCount}
            </span>
          )}
          {cautionCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-200">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
              주의 {cautionCount}
            </span>
          )}
          {dangerCount === 0 && warningCount === 0 && cautionCount === 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              전 구간 안전
            </span>
          )}
        </div>
      </div>

      {/* Scrollable zone list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-slate-400">
            <svg className="w-8 h-8 mb-2 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm">현재 위험 구간 없음</p>
          </div>
        ) : (
          <>
            {visibleZones.map((zone, index) => (
              <AlertItem key={zone.id} zone={zone} rank={index + 1} />
            ))}

            {/* 더 보기 / 접기 버튼 */}
            {hiddenCount > 0 && (
              <button
                onClick={() => setIsExpanded((prev) => !prev)}
                className="w-full flex items-center justify-center gap-1.5 py-3 mt-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 text-xs font-medium hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 active:bg-blue-100 transition-colors min-h-[44px]"
              >
                {isExpanded ? (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                    접기
                  </>
                ) : (
                  <>
                    나머지 {hiddenCount}개 구간 더 보기
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </>
                )}
              </button>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-slate-100 flex-shrink-0 bg-slate-50 rounded-b-xl">
        <p className="text-slate-400 text-[11px] text-center">
          위험 점수 기준 내림차순 정렬 · 1분 간격 자동 갱신
        </p>
      </div>
    </div>
  );
}
