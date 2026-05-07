export type CommunicationStatus = 'NORMAL' | 'DELAYED' | 'DISCONNECTED';

export interface SewerLevelTimeseries {
  timestamp: string;
  sensorId: string;
  locationName: string;
  district: string;
  waterLevelM: number;
  levelChangeRate: number;
  communicationStatus: CommunicationStatus;
}
