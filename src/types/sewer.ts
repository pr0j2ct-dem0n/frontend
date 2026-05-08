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
