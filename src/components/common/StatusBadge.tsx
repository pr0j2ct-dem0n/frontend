import type { RiskLevel } from '../../types/dashboard';
import { RISK_LABELS, RISK_BADGE_CLASSES } from '../../utils/riskStyle';

interface StatusBadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
}

const SIZE_CLASSES = {
  sm: 'px-2 py-0.5 text-[11px]',
  md: 'px-2.5 py-1 text-xs font-semibold',
  lg: 'px-4 py-1.5 text-sm font-semibold',
};

export default function StatusBadge({ level, size = 'md', pulse = false }: StatusBadgeProps) {
  const dotColor =
    level === 'CAUTION' ? 'bg-gray-900' : 'bg-white';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${SIZE_CLASSES[size]} ${RISK_BADGE_CLASSES[level]}`}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColor}`} />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColor}`} />
        </span>
      )}
      {RISK_LABELS[level]}
    </span>
  );
}
