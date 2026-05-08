import type { RiskLevel } from './dashboard';

export interface DistrictRainfall {
  district: string;
  stationName: string;
  rainfall10Min: number;
  rainfall30Min: number;
  rainfall1Hour: number;
  riskLevel: RiskLevel;
}

export interface RainfallTimeseries {
  timestamp: string;
  stationName: string;
  district: string;
  rainfall10MinMm: number;
  rainfall30MinMm: number;
  rainfall1HourMm: number;
}
