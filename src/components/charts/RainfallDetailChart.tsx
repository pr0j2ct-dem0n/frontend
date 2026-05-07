import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { DistrictRainfall } from '../../mocks/rainfallDetailMock';
import { RISK_COLORS } from '../../utils/riskStyle';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface RainfallDetailChartProps {
  data: DistrictRainfall[];
}

const GRID_COLOR = 'rgba(148, 163, 184, 0.2)';
const TICK_COLOR = '#94a3b8';

export default function RainfallDetailChart({ data }: RainfallDetailChartProps) {
  const sorted = [...data].sort((a, b) => b.rainfall10Min - a.rainfall10Min);

  const chartData = {
    labels: sorted.map((d) => d.district),
    datasets: [
      {
        label: '10분 강우량 (mm)',
        data: sorted.map((d) => d.rainfall10Min),
        backgroundColor: sorted.map((d) => RISK_COLORS[d.riskLevel] + 'BB'),
        borderColor: sorted.map((d) => RISK_COLORS[d.riskLevel]),
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
            ` ${(ctx.parsed.x ?? 0).toFixed(1)} mm`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: TICK_COLOR, font: { size: 10 } },
        grid: { color: GRID_COLOR },
        beginAtZero: true,
      },
      y: {
        ticks: { color: '#475569', font: { size: 11 } },
        grid: { color: GRID_COLOR },
      },
    },
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      <h3 className="text-slate-700 text-sm font-semibold mb-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-blue-600" />
        지역별 10분 강우량 순위
        <span className="ml-auto text-slate-400 text-xs font-normal">색상 = 위험도</span>
      </h3>
      <div style={{ height: '280px' }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
