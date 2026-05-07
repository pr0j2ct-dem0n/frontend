import type { SewerSensor } from '../../mocks/sewerDetailMock';
import { RISK_TEXT_CLASSES, RISK_LABELS } from '../../utils/riskStyle';

interface SewerSensorTableProps {
  sensors: SewerSensor[];
}

const STATUS_LABEL: Record<SewerSensor['communicationStatus'], string> = {
  NORMAL: '정상',
  DELAYED: '지연',
  DISCONNECTED: '불통',
};

const STATUS_CLASSES: Record<SewerSensor['communicationStatus'], string> = {
  NORMAL: 'text-green-600 bg-green-50 border-green-200',
  DELAYED: 'text-yellow-700 bg-yellow-50 border-yellow-200',
  DISCONNECTED: 'text-red-600 bg-red-50 border-red-200',
};

export default function SewerSensorTable({ sensors }: SewerSensorTableProps) {
  const sorted = [...sensors].sort((a, b) => b.waterLevelM - a.waterLevelM);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="text-left py-2.5 px-3 text-slate-500 text-xs font-semibold">센서 ID</th>
            <th className="text-left py-2.5 px-3 text-slate-500 text-xs font-semibold">위치</th>
            <th className="text-left py-2.5 px-3 text-slate-500 text-xs font-semibold">행정구</th>
            <th className="text-right py-2.5 px-3 text-slate-500 text-xs font-semibold">수위 (m)</th>
            <th className="text-right py-2.5 px-3 text-slate-500 text-xs font-semibold">용량(%)</th>
            <th className="text-right py-2.5 px-3 text-slate-500 text-xs font-semibold">상승률</th>
            <th className="text-center py-2.5 px-3 text-slate-500 text-xs font-semibold">통신</th>
            <th className="text-center py-2.5 px-3 text-slate-500 text-xs font-semibold">위험도</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((sensor) => (
            <tr key={sensor.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
              <td className="py-2.5 px-3 font-mono text-xs text-slate-400">{sensor.id}</td>
              <td className="py-2.5 px-3 text-slate-800 font-medium text-sm">{sensor.locationName}</td>
              <td className="py-2.5 px-3 text-slate-500 text-sm">{sensor.district}</td>
              <td className="py-2.5 px-3 text-right font-bold text-slate-800">{sensor.waterLevelM.toFixed(2)}</td>
              <td className="py-2.5 px-3 text-right">
                <span className={`font-semibold ${sensor.capacityRate >= 80 ? 'text-red-600' : sensor.capacityRate >= 60 ? 'text-orange-500' : 'text-slate-600'}`}>
                  {sensor.capacityRate}%
                </span>
              </td>
              <td className="py-2.5 px-3 text-right">
                <span className={`font-medium ${sensor.levelChangeRate > 20 ? 'text-red-600' : sensor.levelChangeRate > 10 ? 'text-orange-500' : 'text-slate-500'}`}>
                  +{sensor.levelChangeRate}%/hr
                </span>
              </td>
              <td className="py-2.5 px-3 text-center">
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_CLASSES[sensor.communicationStatus]}`}>
                  {STATUS_LABEL[sensor.communicationStatus]}
                </span>
              </td>
              <td className={`py-2.5 px-3 text-center text-xs font-bold ${RISK_TEXT_CLASSES[sensor.riskLevel]}`}>
                {RISK_LABELS[sensor.riskLevel]}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
