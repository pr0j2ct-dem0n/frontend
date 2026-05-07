import type { RiskZone } from '../../types/risk';
import { RISK_TEXT_CLASSES, RISK_LABELS, RISK_DOT_CLASSES } from '../../utils/riskStyle';

interface AlertItemProps {
  zone: RiskZone;
  rank?: number;
}

const RISK_CARD_CLASSES: Record<string, string> = {
  SAFE: 'bg-white border-slate-200 hover:border-slate-300',
  CAUTION: 'bg-yellow-50 border-yellow-200 hover:border-yellow-300',
  WARNING: 'bg-orange-50 border-orange-200 hover:border-orange-300',
  DANGER: 'bg-red-50 border-red-200 hover:border-red-300',
};

const RISK_METRIC_CLASSES: Record<string, string> = {
  SAFE: 'text-slate-600',
  CAUTION: 'text-yellow-700',
  WARNING: 'text-orange-700',
  DANGER: 'text-red-700',
};

export default function AlertItem({ zone, rank }: AlertItemProps) {
  const isHighRisk = zone.riskLevel === 'DANGER' || zone.riskLevel === 'WARNING';

  return (
    <div className={`rounded-lg border p-3 transition-all ${RISK_CARD_CLASSES[zone.riskLevel]}`}>
      {/* Zone header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          {rank !== undefined && (
            <span className="text-slate-400 text-[11px] font-bold w-5 text-center flex-shrink-0">
              {rank}
            </span>
          )}
          <span
            className={`w-2 h-2 rounded-full flex-shrink-0 ${RISK_DOT_CLASSES[zone.riskLevel]} ${isHighRisk ? 'animate-pulse' : ''}`}
          />
          <div className="min-w-0">
            <p className="text-slate-800 text-sm font-semibold truncate">{zone.name}</p>
            <p className="text-slate-500 text-[11px]">{zone.district}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
          <span className={`text-xs font-bold ${RISK_TEXT_CLASSES[zone.riskLevel]}`}>
            {RISK_LABELS[zone.riskLevel]}
          </span>
          <span className="text-slate-400 text-[11px]">{zone.riskScore}점</span>
        </div>
      </div>

      {/* Reasons */}
      {zone.reasons.length > 0 && (
        <ul className="space-y-0.5 mb-2">
          {zone.reasons.map((reason, i) => (
            <li key={i} className="flex items-start gap-1.5 text-xs text-slate-500">
              <span className={`mt-0.5 flex-shrink-0 ${RISK_TEXT_CLASSES[zone.riskLevel]}`}>•</span>
              {reason}
            </li>
          ))}
        </ul>
      )}

      {/* Metrics row */}
      <div className="pt-2 border-t border-slate-100 flex gap-3 text-[11px]">
        <span className="text-slate-400">
          강우 <span className={`font-semibold ${RISK_METRIC_CLASSES[zone.riskLevel]}`}>{zone.metrics.rainfallMm}mm</span>
        </span>
        <span className="text-slate-400">
          수위 <span className={`font-semibold ${RISK_METRIC_CLASSES[zone.riskLevel]}`}>{zone.metrics.sewerLevelM}m</span>
        </span>
        <span className="text-slate-400">
          용량 <span className={`font-semibold ${RISK_METRIC_CLASSES[zone.riskLevel]}`}>{zone.metrics.sewerCapacityRate}%</span>
        </span>
      </div>
    </div>
  );
}
