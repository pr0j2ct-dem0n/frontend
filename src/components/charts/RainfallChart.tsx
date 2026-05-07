import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import type { ChartData } from 'chart.js';
import type { RainfallTimeseries } from '../../types/rainfall';
import { formatTime } from '../../utils/format';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler);

interface RainfallChartProps {
  data: RainfallTimeseries[];
}

const GRID_COLOR = 'rgba(148, 163, 184, 0.2)';
const TICK_COLOR = '#94a3b8';

const TOOLTIP_DEFAULTS = {
  backgroundColor: '#1e293b',
  titleColor: '#f1f5f9',
  bodyColor: '#94a3b8',
  borderColor: '#334155',
  borderWidth: 1,
  cornerRadius: 6,
  padding: 8,
};

export default function RainfallChart({ data }: RainfallChartProps) {
  const labels = data.map((d) => formatTime(d.timestamp));

  const chartData: ChartData<'bar' | 'line', number[], string> = {
    labels,
    datasets: [
      {
        type: 'bar' as const,
        label: '10분 강우량 (mm)',
        data: data.map((d) => d.rainfall10MinMm),
        backgroundColor: 'rgba(37, 99, 235, 0.65)',
        borderColor: 'rgba(37, 99, 235, 0.9)',
        borderWidth: 1,
        borderRadius: 3,
      },
      {
        type: 'line' as const,
        label: '1시간 강우량 (mm)',
        data: data.map((d) => d.rainfall1HourMm),
        backgroundColor: 'rgba(139, 92, 246, 0.12)',
        borderColor: 'rgba(139, 92, 246, 0.85)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 2.5,
        pointBackgroundColor: 'rgba(139, 92, 246, 1)',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#64748b', font: { size: 11 }, boxWidth: 10 } },
      tooltip: TOOLTIP_DEFAULTS,
    },
    scales: {
      x: {
        ticks: { color: TICK_COLOR, font: { size: 10 } },
        grid: { color: GRID_COLOR },
      },
      y: {
        ticks: { color: TICK_COLOR, font: { size: 10 } },
        grid: { color: GRID_COLOR },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      <h3 className="text-slate-700 text-sm font-semibold mb-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-blue-600" />
        시간대별 강우량
      </h3>
      <div style={{ height: '200px' }}>
        <Chart type="bar" data={chartData} options={options} />
      </div>
    </div>
  );
}
