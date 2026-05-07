export interface FloodHistoryLayer {
  id: string;
  name: string;
  district: string;
  latitude: number;
  longitude: number;
  lastFloodDate: string;
  floodCount5Year: number;
}

export interface PumpStation {
  id: string;
  name: string;
  district: string;
  latitude: number;
  longitude: number;
  capacity: number;
  riverName: string;
}
