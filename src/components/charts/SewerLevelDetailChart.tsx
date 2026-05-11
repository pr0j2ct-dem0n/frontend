import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { SewerGuRiskItem } from '../../types/sewer';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface SewerLevelDetailChartProps {
  data: SewerGuRiskItem[];
}

const GRID_COLOR = 'rgba(148, 163, 184, 0.2)';
const TICK_COLOR = '#94a3b8';

export default function SewerLevelDetailChart({ data }: SewerLevelDetailChartProps) {
  const sorted = [...data].sort((a, b) => b.totalRisk - a.totalRisk);
  const formatGuName = (name: string) => (name.endsWith('구') ? name : `${name}구`);

  const STATUS_COLOR: Record<SewerGuRiskItem['status'], string> = {
    DANGER: '#ef4444',
    WARNING: '#f97316',
    CAUTION: '#eab308',
    NORMAL: '#22c55e',
  };
  const barColors = sorted.map((s) => STATUS_COLOR[s.status]);

  const chartData = {
    labels: sorted.map((s) => s.guName),
    datasets: [
      {
        label: '침수 위험도 (%)',
        data: sorted.map((s) => s.totalRisk),
        backgroundColor: barColors,
        borderColor: barColors,
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
        borderColor: '#334155',
        borderWidth: 1,
        cornerRadius: 6,
        callbacks: {
          title: (items: { dataIndex: number }[]) => {
            const row = sorted[items[0].dataIndex];
            return formatGuName(row.guName);
          },
          label: (item: { dataIndex: number }) => {
            const row = sorted[item.dataIndex];
            return [
              `평균 수위: ${row.avgWaterLevel.toFixed(2)}m`,
              `최대 수위: ${row.maxWaterLevel.toFixed(2)}m`,
              `수위 위험도: ${row.waterRisk.toFixed(1)}%`,
              `강우 위험도: ${row.rainRisk.toFixed(1)}%`,
              `인프라 안정성: +${row.infraScore.toFixed(1)}%`,
              `펌프장 대응력: +${row.pumpScore.toFixed(1)}%`,
              `종합 위험도: ${row.totalRisk.toFixed(1)}%`,
              `상태: ${row.status}`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#475569', font: { size: 10 } },
        grid: { color: GRID_COLOR },
        beginAtZero: true,
        max: 100,
        title: { display: true, text: '위험도 (%)', color: TICK_COLOR, font: { size: 10 } },
      },
      y: {
        ticks: { color: TICK_COLOR, font: { size: 10 } },
        grid: { color: GRID_COLOR },
      },
    },
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      <h3 className="text-slate-700 text-sm font-semibold mb-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-orange-500" />
        자치구별 종합 침수 대응 위험도 TOP 10
      </h3>
      <div style={{ height: '240px' }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
