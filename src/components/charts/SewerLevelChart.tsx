import {
  Chart as ChartJS,
  CategoryScale, LinearScale, LineElement,
  PointElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { SewerLevelTimeseries } from '../../types/sewer';
import { formatTime } from '../../utils/format';

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend, Filler);

interface SewerLevelChartProps {
  data: SewerLevelTimeseries[];
}

const GRID_COLOR = 'rgba(148, 163, 184, 0.2)';
const TICK_COLOR = '#94a3b8';

export default function SewerLevelChart({ data }: SewerLevelChartProps) {
  const labels = data.map((d) => formatTime(d.timestamp));
  const levels = data.map((d) => d.waterLevelM);

  const maxLevel = Math.max(...levels);
  const dangerLine = 2.0;
  const isDangerous = levels[levels.length - 1] >= dangerLine;

  const lineColor = isDangerous ? 'rgba(239, 68, 68, 1)' : 'rgba(249, 115, 22, 1)';
  const fillColor = isDangerous ? 'rgba(239, 68, 68, 0.1)' : 'rgba(249, 115, 22, 0.1)';

  const chartData = {
    labels,
    datasets: [
      {
        label: '하수관 수위 (m)',
        data: levels,
        borderColor: lineColor,
        backgroundColor: fillColor,
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 2.5,
        pointBackgroundColor: lineColor,
      },
      {
        label: '위험수위 2.0m',
        data: labels.map(() => dangerLine),
        borderColor: 'rgba(239, 68, 68, 0.7)',
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderDash: [5, 4],
        fill: false,
        tension: 0,
        pointRadius: 0,
        pointHoverRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#64748b', font: { size: 11 }, boxWidth: 10 } },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
        borderColor: '#334155',
        borderWidth: 1,
        cornerRadius: 6,
        padding: 8,
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
        beginAtZero: true,
        max: Math.max(dangerLine + 0.5, maxLevel + 0.3),
      },
    },
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      <h3 className="text-slate-700 text-sm font-semibold mb-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-orange-500" />
        시간대별 하수관 수위
        <span className="ml-auto text-slate-400 text-xs font-normal">위험수위 {dangerLine}m</span>
      </h3>
      <div style={{ height: '200px' }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
