import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { SewerSensor } from '../../mocks/sewerDetailMock';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface SewerLevelDetailChartProps {
  sensors: SewerSensor[];
}

const GRID_COLOR = 'rgba(148, 163, 184, 0.2)';
const TICK_COLOR = '#94a3b8';

export default function SewerLevelDetailChart({ sensors }: SewerLevelDetailChartProps) {
  const sorted = [...sensors].sort((a, b) => b.waterLevelM - a.waterLevelM);

  const barColors = sorted.map((s) => {
    if (s.capacityRate >= 80) return 'rgba(239, 68, 68, 0.75)';
    if (s.capacityRate >= 60) return 'rgba(249, 115, 22, 0.75)';
    if (s.capacityRate >= 40) return 'rgba(234, 179, 8, 0.75)';
    return 'rgba(34, 197, 94, 0.75)';
  });

  const chartData = {
    labels: sorted.map((s) => s.district),
    datasets: [
      {
        label: '현재 수위 (m)',
        data: sorted.map((s) => s.waterLevelM),
        backgroundColor: barColors,
        borderColor: barColors.map((c) => c.replace('0.75', '1')),
        borderWidth: 1.5,
        borderRadius: 4,
      },
      {
        label: '최대 용량 (m)',
        data: sorted.map((s) => s.maxCapacityM),
        backgroundColor: 'rgba(148, 163, 184, 0.2)',
        borderColor: 'rgba(148, 163, 184, 0.6)',
        borderWidth: 1.5,
        borderRadius: 4,
        borderDash: [4, 4],
      },
    ],
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
      },
    },
    scales: {
      x: {
        ticks: { color: '#475569', font: { size: 10 } },
        grid: { color: GRID_COLOR },
      },
      y: {
        ticks: { color: TICK_COLOR, font: { size: 10 } },
        grid: { color: GRID_COLOR },
        beginAtZero: true,
        max: 2.6,
        title: { display: true, text: '수위 (m)', color: TICK_COLOR, font: { size: 10 } },
      },
    },
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      <h3 className="text-slate-700 text-sm font-semibold mb-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-orange-500" />
        센서별 수위 현황 vs 최대 용량
      </h3>
      <div style={{ height: '240px' }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
