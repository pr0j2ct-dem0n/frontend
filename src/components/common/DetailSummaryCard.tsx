import type { ReactNode } from 'react';

interface DetailSummaryCardProps {
  title: string;
  value: ReactNode;
  unit?: string;
  sub?: ReactNode;
  icon?: ReactNode;
  iconBg?: string;
  accentColor?: string;
  highlight?: boolean;
  badge?: ReactNode;
}

export default function DetailSummaryCard({
  title,
  value,
  unit,
  sub,
  icon,
  iconBg = 'bg-blue-700',
  accentColor = 'border-l-blue-500',
  highlight = false,
  badge,
}: DetailSummaryCardProps) {
  return (
    <div
      className={`rounded-xl border bg-white p-4 flex flex-col gap-2.5 shadow-sm border-l-4 transition-all
        ${highlight
          ? 'border-l-red-500 border-t border-r border-b border-red-100 bg-red-50'
          : `${accentColor} border-t border-r border-b border-slate-200`}`}
    >
      <div className="flex items-start justify-between">
        {icon && (
          <div className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0 shadow-sm`}>
            {icon}
          </div>
        )}
        {badge && <div>{badge}</div>}
      </div>
      <div>
        <p className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider mb-0.5">{title}</p>
        <div className="flex items-baseline gap-1">
          <span className={`text-xl font-bold ${highlight ? 'text-red-600' : 'text-slate-900'}`}>{value}</span>
          {unit && <span className="text-slate-400 text-sm">{unit}</span>}
        </div>
        {sub && <p className="text-slate-400 text-xs mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
