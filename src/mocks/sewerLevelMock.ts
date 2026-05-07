import type { SewerLevelTimeseries } from '../types/sewer';

const now = new Date();
const generateTimestamps = (count: number) =>
  Array.from({ length: count }, (_, i) => {
    const d = new Date(now.getTime() - (count - 1 - i) * 10 * 60 * 1000);
    return d.toISOString();
  });

const timestamps = generateTimestamps(12);

export const mockSewerLevelTimeseries: SewerLevelTimeseries[] = timestamps.map((ts, i) => ({
  timestamp: ts,
  sensorId: 'SWR-GN-001',
  locationName: '강남구 논현동',
  district: '강남구',
  waterLevelM: [0.5, 0.55, 0.62, 0.74, 0.91, 1.12, 1.35, 1.58, 1.77, 1.92, 2.05, 2.18][i],
  levelChangeRate: [0, 2.1, 4.5, 8.2, 12.4, 18.6, 22.3, 25.1, 27.8, 30.2, 33.5, 37.1][i],
  communicationStatus: 'NORMAL',
}));
