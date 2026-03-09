export interface WaterRecord {
  id: string;
  source: string;
  consumption: number;
  date: string;
  facility?: string;
  notes?: string;
  createdAt: string;
}
