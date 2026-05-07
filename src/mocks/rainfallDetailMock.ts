import type { RiskLevel } from '../types/dashboard';

export interface DistrictRainfall {
  district: string;
  stationName: string;
  rainfall10Min: number;
  rainfall30Min: number;
  rainfall1Hour: number;
  riskLevel: RiskLevel;
}

export const mockDistrictRainfall: DistrictRainfall[] = [
  { district: '강남구', stationName: '강남관측소', rainfall10Min: 18.3, rainfall30Min: 42.6, rainfall1Hour: 75.1, riskLevel: 'DANGER' },
  { district: '관악구', stationName: '신림관측소', rainfall10Min: 14.5, rainfall30Min: 35.2, rainfall1Hour: 62.4, riskLevel: 'WARNING' },
  { district: '동작구', stationName: '사당관측소', rainfall10Min: 12.1, rainfall30Min: 28.5, rainfall1Hour: 52.3, riskLevel: 'WARNING' },
  { district: '영등포구', stationName: '도림관측소', rainfall10Min: 10.8, rainfall30Min: 24.3, rainfall1Hour: 45.6, riskLevel: 'CAUTION' },
  { district: '서초구', stationName: '반포관측소', rainfall10Min: 9.2, rainfall30Min: 21.1, rainfall1Hour: 38.9, riskLevel: 'CAUTION' },
  { district: '종로구', stationName: '광화문관측소', rainfall10Min: 7.4, rainfall30Min: 15.8, rainfall1Hour: 28.3, riskLevel: 'CAUTION' },
  { district: '송파구', stationName: '잠실관측소', rainfall10Min: 5.8, rainfall30Min: 12.4, rainfall1Hour: 22.7, riskLevel: 'CAUTION' },
  { district: '마포구', stationName: '상암관측소', rainfall10Min: 3.2, rainfall30Min: 8.5, rainfall1Hour: 15.1, riskLevel: 'SAFE' },
  { district: '노원구', stationName: '중계관측소', rainfall10Min: 2.1, rainfall30Min: 5.3, rainfall1Hour: 9.8, riskLevel: 'SAFE' },
  { district: '강북구', stationName: '미아관측소', rainfall10Min: 1.5, rainfall30Min: 3.8, rainfall1Hour: 7.2, riskLevel: 'SAFE' },
];
