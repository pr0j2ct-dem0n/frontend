import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface KpiCardProps {
  title: string;
  value: ReactNode;
  unit?: string;
  subValue?: ReactNode;
  icon: ReactNode;
  iconBg?: string;
  trend?: 'up' | 'down' | 'neutral';
  highlight?: boolean;
  badge?: ReactNode;
  accentColor?: string;
  to?: string;
}

export default function KpiCard({
  title,
  value,
  unit,
  subValue,
  icon,
  iconBg = 'bg-blue-700',
  trend,
  highlight = false,
  badge,
  accentColor = 'border-l-blue-500',
  to,
}: KpiCardProps) {
  const navigate = useNavigate();

  const trendIcon =
    trend === 'up' ? (
      <span className="text-red-500 text-xs font-bold">▲</span>
    ) : trend === 'down' ? (
      <span className="text-green-500 text-xs font-bold">▼</span>
    ) : null;

  return (
    <div
      onClick={to ? () => navigate(to) : undefined}
      className={`rounded-xl border bg-white p-4 sm:p-5 flex flex-col gap-2.5 sm:gap-3 shadow-sm border-l-4 transition-all
        ${highlight
          ? 'border-l-red-500 border-t border-r border-b border-red-100 bg-red-50'
          : `${accentColor} border-t border-r border-b border-slate-200`}
        ${to ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1 active:translate-y-0 group' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0 shadow-sm ${to ? 'group-hover:scale-105 transition-transform' : ''}`}>
          {icon}
        </div>
        {badge && <div>{badge}</div>}
      </div>

      <div className="flex-1">
        <p className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider mb-1">{title}</p>
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className={`text-[1.75rem] sm:text-[2rem] font-bold leading-none ${highlight ? 'text-red-600' : 'text-slate-900'}`}>
            {value}
          </span>
          {unit && <span className="text-slate-400 text-sm">{unit}</span>}
          {trendIcon}
        </div>
        {subValue && <p className="text-slate-400 text-xs mt-1">{subValue}</p>}
      </div>

      {to && (
        <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-1">
          <span className="text-blue-600 text-xs font-medium group-hover:text-blue-700 transition-colors">
            자세히 보기
          </span>
          <svg className="w-3.5 h-3.5 text-blue-500 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      )}
    </div>
  );
}
