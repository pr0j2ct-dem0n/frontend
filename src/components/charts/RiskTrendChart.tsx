import {
  Chart as ChartJS,
  CategoryScale, LinearScale, LineElement,
  PointElement, Title, Tooltip, Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { RiskZone } from '../../types/risk';

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);

interface RiskTrendChartProps {
  zones: RiskZone[];
}

const HOURS = ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '지금'];
const LINE_COLORS = ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6'];

function generateTrend(currentScore: number): number[] {
  const base = Math.max(10, currentScore - 60);
  return HOURS.map((_, i) => {
    const progress = i / (HOURS.length - 1);
    const noise = (Math.random() - 0.5) * 8;
    return Math.min(100, Math.max(0, base + (currentScore - base) * progress + noise));
  });
}

const GRID_COLOR = 'rgba(148, 163, 184, 0.2)';
const TICK_COLOR = '#94a3b8';

export default function RiskTrendChart({ zones }: RiskTrendChartProps) {
  const top3 = [...zones]
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 3);

  const chartData = {
    labels: HOURS,
    datasets: top3.map((zone, i) => ({
      label: zone.name,
      data: generateTrend(zone.riskScore),
      borderColor: LINE_COLORS[i],
      backgroundColor: 'transparent',
      borderWidth: 2,
      tension: 0.4,
      pointRadius: 2,
      pointBackgroundColor: LINE_COLORS[i],
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#64748b', font: { size: 11 }, boxWidth: 10 },
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
        borderColor: '#334155',
        borderWidth: 1,
        cornerRadius: 6,
        padding: 8,
        callbacks: {
          label: (ctx: import('chart.js').TooltipItem<'line'>) =>
            `${ctx.dataset.label ?? ''}: ${(ctx.parsed.y ?? 0).toFixed(0)}점`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: TICK_COLOR, font: { size: 10 } },
        grid: { color: GRID_COLOR },
      },
      y: {
        ticks: { color: TICK_COLOR, font: { size: 10 } },
        grid: { color: GRID_COLOR },
        min: 0,
        max: 100,
        title: {
          display: true,
          text: '위험 점수',
          color: TICK_COLOR,
          font: { size: 10 },
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      <h3 className="text-slate-700 text-sm font-semibold mb-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-red-500" />
        위험도 추이 (상위 3개소)
      </h3>
      <div style={{ height: '200px' }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
