export interface Supplier {
  id: string;
  name: string;
  category: string;
  location?: string;
  carbonFootprint?: number;
  certifications?: string[];
  riskScore?: number;
  lastAssessment?: string;
  createdAt: string;
}
