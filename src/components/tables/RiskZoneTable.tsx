import type { RiskZone } from '../../types/risk';
import { RISK_TEXT_CLASSES, RISK_LABELS, RISK_DOT_CLASSES } from '../../utils/riskStyle';

interface RiskZoneTableProps {
  zones: RiskZone[];
}

export default function RiskZoneTable({ zones }: RiskZoneTableProps) {
  const sorted = [...zones].sort((a, b) => b.riskScore - a.riskScore);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="text-left py-2.5 px-3 text-slate-500 text-xs font-semibold">순위</th>
            <th className="text-left py-2.5 px-3 text-slate-500 text-xs font-semibold">지역명</th>
            <th className="text-left py-2.5 px-3 text-slate-500 text-xs font-semibold">행정구</th>
            <th className="text-right py-2.5 px-3 text-slate-500 text-xs font-semibold">위험 점수</th>
            <th className="text-center py-2.5 px-3 text-slate-500 text-xs font-semibold">위험 단계</th>
            <th className="text-right py-2.5 px-3 text-slate-500 text-xs font-semibold">강우(mm)</th>
            <th className="text-right py-2.5 px-3 text-slate-500 text-xs font-semibold">수위(m)</th>
            <th className="text-left py-2.5 px-3 text-slate-500 text-xs font-semibold">주요 원인</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((zone, idx) => (
            <tr key={zone.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
              <td className="py-2.5 px-3 text-slate-400 text-xs font-bold">{idx + 1}</td>
              <td className="py-2.5 px-3">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${RISK_DOT_CLASSES[zone.riskLevel]}`} />
                  <span className="text-slate-800 font-medium">{zone.name}</span>
                </div>
              </td>
              <td className="py-2.5 px-3 text-slate-500">{zone.district}</td>
              <td className="py-2.5 px-3 text-right font-bold text-slate-800">{zone.riskScore}</td>
              <td className={`py-2.5 px-3 text-center text-xs font-bold ${RISK_TEXT_CLASSES[zone.riskLevel]}`}>
                {RISK_LABELS[zone.riskLevel]}
              </td>
              <td className="py-2.5 px-3 text-right text-slate-600">{zone.metrics.rainfallMm}</td>
              <td className="py-2.5 px-3 text-right text-slate-600">{zone.metrics.sewerLevelM}</td>
              <td className="py-2.5 px-3 text-slate-500 text-xs max-w-[200px] truncate">
                {zone.reasons[0] ?? '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
