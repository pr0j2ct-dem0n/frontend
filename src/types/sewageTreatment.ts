export type OperationStatus = '운영중' | '점검중' | '중지';

export interface SewageTreatmentFacility {
  id: string;
  name: string;
  address: string;
  district: string;
  latitude: number;
  longitude: number;
  capacityM3PerDay: number;
  treatmentMethod: string;
  operationStatus: OperationStatus;
}
