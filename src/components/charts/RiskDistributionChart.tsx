import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import type { RiskZone } from '../../types/risk';

ChartJS.register(ArcElement, Tooltip, Legend);

interface RiskDistributionChartProps {
  zones: RiskZone[];
}

export default function RiskDistributionChart({ zones }: RiskDistributionChartProps) {
  const counts = {
    DANGER: zones.filter((z) => z.riskLevel === 'DANGER').length,
    WARNING: zones.filter((z) => z.riskLevel === 'WARNING').length,
    CAUTION: zones.filter((z) => z.riskLevel === 'CAUTION').length,
    SAFE: zones.filter((z) => z.riskLevel === 'SAFE').length,
  };

  const chartData = {
    labels: ['안전', '주의', '경고', '위험'],
    datasets: [
      {
        data: [counts.SAFE, counts.CAUTION, counts.WARNING, counts.DANGER],
        backgroundColor: ['#22C55E', '#EAB308', '#F97316', '#EF4444'],
        borderColor: '#ffffff',
        borderWidth: 3,
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { color: '#64748b', font: { size: 11 }, padding: 12, boxWidth: 12 },
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
        borderColor: '#334155',
        borderWidth: 1,
        cornerRadius: 6,
        callbacks: {
          label: (ctx: import('chart.js').TooltipItem<'doughnut'>) =>
            ` ${ctx.label}: ${ctx.parsed}개소`,
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      <h3 className="text-slate-700 text-sm font-semibold mb-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-blue-600" />
        위험도 분포
      </h3>
      <div style={{ height: '220px' }}>
        <Doughnut data={chartData} options={options} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-center">
        {[
          { label: '안전', count: counts.SAFE, color: 'text-green-600' },
          { label: '주의', count: counts.CAUTION, color: 'text-yellow-600' },
          { label: '경고', count: counts.WARNING, color: 'text-orange-500' },
          { label: '위험', count: counts.DANGER, color: 'text-red-600' },
        ].map((item) => (
          <div key={item.label} className="bg-slate-50 rounded-lg py-1.5">
            <p className={`text-base font-bold ${item.color}`}>{item.count}</p>
            <p className="text-slate-500">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
