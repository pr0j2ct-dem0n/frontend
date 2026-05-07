import type { FloodHistoryLayer, PumpStation } from '../types/map';

export const mockFloodHistory: FloodHistoryLayer[] = [
  { id: 'FH-001', name: '논현동 저지대', district: '강남구', latitude: 37.5152, longitude: 127.0303, lastFloodDate: '2023-07-15', floodCount5Year: 3 },
  { id: 'FH-002', name: '도림천 주변', district: '영등포구', latitude: 37.5172, longitude: 126.9032, lastFloodDate: '2024-08-01', floodCount5Year: 5 },
  { id: 'FH-003', name: '대방동 지하차도', district: '동작구', latitude: 37.5094, longitude: 126.9393, lastFloodDate: '2022-09-05', floodCount5Year: 2 },
  { id: 'FH-004', name: '광화문 광장', district: '종로구', latitude: 37.5759, longitude: 126.9769, lastFloodDate: '2021-08-22', floodCount5Year: 1 },
  { id: 'FH-005', name: '신림동 고시촌', district: '관악구', latitude: 37.4845, longitude: 126.9290, lastFloodDate: '2022-07-12', floodCount5Year: 4 },
];

export const mockPumpStations: PumpStation[] = [
  { id: 'PS-001', name: '강남빗물펌프장', district: '강남구', latitude: 37.5180, longitude: 127.0250, capacity: 18500, riverName: '탄천' },
  { id: 'PS-002', name: '도림빗물펌프장', district: '영등포구', latitude: 37.5200, longitude: 126.9000, capacity: 22000, riverName: '도림천' },
  { id: 'PS-003', name: '사당빗물펌프장', district: '동작구', latitude: 37.5050, longitude: 126.9780, capacity: 15000, riverName: '한강' },
  { id: 'PS-004', name: '마포빗물펌프장', district: '마포구', latitude: 37.5580, longitude: 126.9100, capacity: 28000, riverName: '한강' },
  { id: 'PS-005', name: '송파빗물펌프장', district: '송파구', latitude: 37.5120, longitude: 127.1100, capacity: 19500, riverName: '성내천' },
];
