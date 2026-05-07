export interface RainfallTimeseries {
  timestamp: string;
  stationName: string;
  district: string;
  rainfall10MinMm: number;
  rainfall30MinMm: number;
  rainfall1HourMm: number;
}
