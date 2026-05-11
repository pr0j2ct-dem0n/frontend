import type { RiskLevel } from './dashboard';

export type CommunicationStatus = 'NORMAL' | 'DELAYED' | 'DISCONNECTED';

export interface SewerSensor {
  id: string;
  locationName: string;
  district: string;
  waterLevelM: number;
  maxCapacityM: number;
  capacityRate: number;
  levelChangeRate: number;
  communicationStatus: CommunicationStatus;
  riskLevel: RiskLevel;
}

export interface SewerLevelTimeseries {
  timestamp: string;
  sensorId: string;
  locationName: string;
  district: string;
  waterLevelM: number;
  levelChangeRate: number;
  communicationStatus: CommunicationStatus;
}

export interface SewerGuRiskItem {
  guName: string;
  avgWaterLevel: number;
  maxWaterLevel: number;
  stationCount: number;
  maxCapacity: number;
  waterRisk: number;
  rainRisk: number;
  infraScore: number;
  pumpScore: number;
  totalRisk: number;
  status: 'NORMAL' | 'CAUTION' | 'WARNING' | 'DANGER';
  rainfall: number;
  pumpCount: number;
  pumpCapacity: number;
  facilityCapacity: number;
}
