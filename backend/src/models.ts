export type Emission = {
  userId: string;
  id: string;
  source: string;
  amount: number; // kg CO2e
  date: string; // ISO date string
  facility?: string;
  notes?: string;
  createdAt: string;
};

export type EnergyRecord = {
  userId: string;
  id: string;
  source: string;
  facility?: string;
  consumption: number; // kWh
  cost?: number;
  date: string; // ISO date string
  createdAt: string;
};

export type WaterRecord = {
  userId: string;
  id: string;
  source: string;
  consumption: number; // liters
  date: string; // ISO date string
  facility?: string;
  notes?: string;
  createdAt: string;
};

export type WasteRecord = {
  userId: string;
  id: string;
  date: string; // ISO date string
  type: string; // e.g. Recycled/General/Organic
  facility?: string;
  amount: number; // kg
  disposalMethod?: string;
  createdAt: string;
};

export type Supplier = {
  userId: string;
  id: string;
  name: string;
  category: string;
  location?: string;
  carbonFootprint?: number;
  certifications?: string[];
  riskScore?: number;
  lastAssessment?: string; // YYYY-MM-DD
};

export type ComplianceStatus = "Compliant" | "Pending" | "Non-Compliant";

export type ComplianceRecord = {
  userId: string;
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: ComplianceStatus | string;
  lastAudit?: string | null;
  createdAt: string;
};

export type GoalStatus = "on-track" | "at-risk" | "behind";

export type Goal = {
  userId: string;
  id: string;
  title: string;
  category: string;
  target: number;
  unit: string;
  deadline: string;
  progress: number;
  status: GoalStatus;
  createdAt: string;
};

export type Team = {
  userId: string;
  id: string;
  name: string;
  lead?: string;
  members?: string[] | string;
  responsibilities?: string[] | string;
  projectsActive: number;
};

export type Report = {
  userId: string;
  id: string;
  title: string;
  generated: string;
  type: string;
  status: string;
  downloads: number;
  emissions: number;
  renewableEnergy: number;
  waterUsage: number;
  wasteRecycled: number;
};

export type AlertSeverity = "high" | "medium" | "low";
export type AlertStatus = "active" | "investigating" | "pending_action" | "resolved";

export type AlertRecord = {
  userId: string;
  id: string;
  type: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  affectedArea?: string;
  status: AlertStatus;
  createdAt: string;
};

export type RecommendationPriority = "high" | "medium" | "low";

export type RecommendationRecord = {
  userId: string;
  id: string;
  title: string;
  description: string;
  impact: string;
  savings: string;
  category: string;
  priority: RecommendationPriority;
  createdAt: string;
};

