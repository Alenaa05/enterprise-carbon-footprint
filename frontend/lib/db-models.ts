// DynamoDB Models for Enterprise Sustainability Platform
// These models map to DynamoDB tables with the appropriate structure

export interface Organization {
  id: string;
  name: string;
  industry: string;
  employees: number;
  headquarters: string;
  sustainabilityGoals: SustainabilityGoal[];
  createdAt: string;
  updatedAt: string;
}

export interface SustainabilityGoal {
  id: string;
  title: string;
  target: number;
  unit: string;
  deadline: string;
  category: 'carbon' | 'energy' | 'water' | 'waste';
  progress: number;
  status: 'on-track' | 'at-risk' | 'behind';
}

export interface CarbonEmission {
  id: string;
  organizationId: string;
  source: 'energy' | 'transportation' | 'waste' | 'supply-chain' | 'other';
  amount: number; // in kg CO2e
  date: string;
  facility?: string;
  notes?: string;
  createdAt: string;
}

export interface EnergyUsage {
  id: string;
  organizationId: string;
  type: 'electricity' | 'natural-gas' | 'renewable';
  amount: number; // in kWh
  cost: number;
  date: string;
  facility: string;
  createdAt: string;
}

export interface WaterUsage {
  id: string;
  organizationId: string;
  source: 'municipal' | 'recycled' | 'groundwater';
  amount: number; // in liters
  cost: number;
  date: string;
  facility: string;
  createdAt: string;
}

export interface WasteData {
  id: string;
  organizationId: string;
  type: 'general' | 'hazardous' | 'recycled' | 'organic';
  amount: number; // in kg
  disposalMethod: string;
  date: string;
  facility: string;
  createdAt: string;
}

export interface ComplianceRecord {
  id: string;
  organizationId: string;
  regulation: string;
  status: 'compliant' | 'non-compliant' | 'pending';
  dueDate: string;
  lastAuditDate?: string;
  notes: string;
  createdAt: string;
}

export interface Report {
  id: string;
  organizationId: string;
  type: 'quarterly' | 'annual' | 'sustainability' | 'compliance';
  period: string;
  generatedAt: string;
  data: {
    carbonEmissions: number;
    energyUsage: number;
    waterUsage: number;
    wasteGenerated: number;
    keyInsights: string[];
    recommendations: string[];
  };
}

export interface Supplier {
  id: string;
  organizationId: string;
  name: string;
  category: string;
  carbonFootprint?: number;
  certifications: string[];
  riskScore: number; // 0-100, higher = riskier
  lastAssessment: string;
  createdAt: string;
}

export interface Team {
  id: string;
  organizationId: string;
  name: string;
  lead: string;
  members: string[];
  responsibilities: string[];
  createdAt: string;
}

export interface TeamGoal {
  id: string;
  teamId: string;
  organizationId: string;
  title: string;
  target: number;
  unit: string;
  deadline: string;
  owner: string;
  progress: number;
  status: 'active' | 'completed' | 'paused';
  createdAt: string;
}

export interface AIInsight {
  id: string;
  organizationId: string;
  type: 'anomaly' | 'recommendation' | 'forecast' | 'optimization';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionItems: string[];
  generatedAt: string;
  resolved: boolean;
}
