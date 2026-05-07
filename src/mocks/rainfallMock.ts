import type { RainfallTimeseries } from '../types/rainfall';

const now = new Date();
const generateTimestamps = (count: number) =>
  Array.from({ length: count }, (_, i) => {
    const d = new Date(now.getTime() - (count - 1 - i) * 10 * 60 * 1000);
    return d.toISOString();
  });

const timestamps = generateTimestamps(12);

export const mockRainfallTimeseries: RainfallTimeseries[] = timestamps.map((ts, i) => ({
  timestamp: ts,
  stationName: '강남관측소',
  district: '강남구',
  rainfall10MinMm: [0, 0.2, 0.5, 1.2, 2.4, 4.8, 6.3, 8.1, 10.2, 12.4, 15.1, 18.3][i],
  rainfall30MinMm: [0, 0.5, 1.2, 2.8, 5.1, 9.2, 13.5, 18.0, 23.2, 28.5, 34.1, 42.6][i],
  rainfall1HourMm: [0, 0.8, 2.1, 4.3, 7.9, 14.2, 21.3, 29.1, 38.4, 48.2, 59.3, 75.1][i],
}));
