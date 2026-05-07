import type { RiskLevel } from '../types/dashboard';

export interface SewerSensor {
  id: string;
  locationName: string;
  district: string;
  waterLevelM: number;
  maxCapacityM: number;
  capacityRate: number;
  levelChangeRate: number;
  communicationStatus: 'NORMAL' | 'DELAYED' | 'DISCONNECTED';
  riskLevel: RiskLevel;
}

export const mockSewerSensors: SewerSensor[] = [
  { id: 'SWR-GN-001', locationName: '논현동 저지대', district: '강남구', waterLevelM: 2.18, maxCapacityM: 2.3, capacityRate: 95, levelChangeRate: 37.1, communicationStatus: 'NORMAL', riskLevel: 'DANGER' },
  { id: 'SWR-YD-001', locationName: '도림천 주변', district: '영등포구', waterLevelM: 1.72, maxCapacityM: 2.1, capacityRate: 82, levelChangeRate: 25.3, communicationStatus: 'NORMAL', riskLevel: 'WARNING' },
  { id: 'SWR-DJ-001', locationName: '대방동 지하차도', district: '동작구', waterLevelM: 1.55, maxCapacityM: 2.1, capacityRate: 74, levelChangeRate: 18.6, communicationStatus: 'NORMAL', riskLevel: 'WARNING' },
  { id: 'SWR-SC-001', locationName: '반포동', district: '서초구', waterLevelM: 1.45, maxCapacityM: 2.0, capacityRate: 73, levelChangeRate: 14.8, communicationStatus: 'DISCONNECTED', riskLevel: 'WARNING' },
  { id: 'SWR-GK-001', locationName: '신림동 고시촌', district: '관악구', waterLevelM: 1.28, maxCapacityM: 2.0, capacityRate: 64, levelChangeRate: 15.2, communicationStatus: 'DELAYED', riskLevel: 'CAUTION' },
  { id: 'SWR-JN-001', locationName: '광화문 광장 인근', district: '종로구', waterLevelM: 1.12, maxCapacityM: 2.0, capacityRate: 56, levelChangeRate: 12.4, communicationStatus: 'NORMAL', riskLevel: 'CAUTION' },
  { id: 'SWR-SP-001', locationName: '석촌 지하차도', district: '송파구', waterLevelM: 0.98, maxCapacityM: 2.0, capacityRate: 49, levelChangeRate: 8.3, communicationStatus: 'NORMAL', riskLevel: 'CAUTION' },
  { id: 'SWR-MP-001', locationName: '상암동', district: '마포구', waterLevelM: 0.42, maxCapacityM: 2.0, capacityRate: 21, levelChangeRate: 2.1, communicationStatus: 'NORMAL', riskLevel: 'SAFE' },
  { id: 'SWR-NW-001', locationName: '중계동', district: '노원구', waterLevelM: 0.31, maxCapacityM: 2.0, capacityRate: 16, levelChangeRate: 1.2, communicationStatus: 'NORMAL', riskLevel: 'SAFE' },
  { id: 'SWR-GB-001', locationName: '미아동', district: '강북구', waterLevelM: 0.28, maxCapacityM: 2.0, capacityRate: 14, levelChangeRate: 0.8, communicationStatus: 'NORMAL', riskLevel: 'SAFE' },
];
