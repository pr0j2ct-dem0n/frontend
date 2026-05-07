import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { RiskZone } from '../../types/risk';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

interface RiskReasonChartProps {
  zones: RiskZone[];
}

const GRID_COLOR = 'rgba(148, 163, 184, 0.2)';
const TICK_COLOR = '#94a3b8';

export default function RiskReasonChart({ zones }: RiskReasonChartProps) {
  const reasonCounts: Record<string, number> = {};
  zones.forEach((z) => {
    z.reasons.forEach((r) => {
      reasonCounts[r] = (reasonCounts[r] ?? 0) + 1;
    });
  });

  const sorted = Object.entries(reasonCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6);

  const chartData = {
    labels: sorted.map(([label]) => label),
    datasets: [
      {
        label: '해당 구간 수',
        data: sorted.map(([, count]) => count),
        backgroundColor: 'rgba(37, 99, 235, 0.65)',
        borderColor: 'rgba(37, 99, 235, 0.9)',
        borderWidth: 1.5,
        borderRadius: 4,
      },
    ],
  };

  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
        borderColor: '#334155',
        borderWidth: 1,
        cornerRadius: 6,
        callbacks: {
          label: (ctx: import('chart.js').TooltipItem<'bar'>) =>
            ` ${ctx.parsed.x}개 구간에서 감지`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: TICK_COLOR, font: { size: 10 }, stepSize: 1 },
        grid: { color: GRID_COLOR },
        beginAtZero: true,
      },
      y: {
        ticks: { color: '#475569', font: { size: 10 } },
        grid: { color: GRID_COLOR },
      },
    },
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      <h3 className="text-slate-700 text-sm font-semibold mb-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-orange-500" />
        위험 원인별 발생 빈도
      </h3>
      <div style={{ height: '220px' }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
