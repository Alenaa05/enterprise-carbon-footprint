/**
 * api.ts — Frontend API client
 *
 * Notes:
 * - No AWS access key or secret belongs in the frontend
 * - Auth is sent as Cognito Bearer token only
 * - Reads token from sessionStorage first, then falls back to Cognito localStorage keys
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

if (!API_BASE) {
  console.error(
    "[api.ts] NEXT_PUBLIC_API_BASE is not set. Add it to .env.local or hosting env vars."
  );
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;

  const sessionToken = sessionStorage.getItem("idToken");
  if (sessionToken) return sessionToken;

  const localToken =
    localStorage.getItem("idToken") || localStorage.getItem("accessToken");
  if (localToken) return localToken;

  const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
  if (!clientId) return null;

  const lastAuthUser = localStorage.getItem(
    `CognitoIdentityServiceProvider.${clientId}.LastAuthUser`
  );
  if (!lastAuthUser) return null;

  const cognitoIdToken = localStorage.getItem(
    `CognitoIdentityServiceProvider.${clientId}.${lastAuthUser}.idToken`
  );
  if (cognitoIdToken) return cognitoIdToken;

  const cognitoAccessToken = localStorage.getItem(
    `CognitoIdentityServiceProvider.${clientId}.${lastAuthUser}.accessToken`
  );
  return cognitoAccessToken || null;
}

function clearStoredTokens() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem("idToken");
  sessionStorage.removeItem("accessToken");
  localStorage.removeItem("idToken");
  localStorage.removeItem("accessToken");
}

async function request(path: string, options: RequestInit = {}) {
  if (!API_BASE) {
    throw new Error("NEXT_PUBLIC_API_BASE is not configured. Check your .env.local.");
  }

  const token = getToken();
  if (!token) {
    throw new Error("Not authenticated");
  }

  const mergedHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...(options.headers || {}),
  };

  console.log("[api] request", {
    url: `${API_BASE}${path}`,
    hasToken: !!token,
    method: options.method || "GET",
  });

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: mergedHeaders,
  });

  if (res.status === 401) {
    clearStoredTokens();
    window.location.href = "/login";
    throw new Error("Session expired");
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `API error ${res.status}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }

  return res.text();
}

async function requestRaw(path: string): Promise<Response> {
  if (!API_BASE) {
    throw new Error("NEXT_PUBLIC_API_BASE is not configured.");
  }

  const token = getToken();
  if (!token) {
    throw new Error("Not authenticated");
  }

  console.log("[api] raw request", {
    url: `${API_BASE}${path}`,
    hasToken: !!token,
  });

  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 401) {
    clearStoredTokens();
    window.location.href = "/login";
    throw new Error("Session expired");
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `API error ${res.status}`);
  }

  return res;
}

/* =========================
   EMISSIONS
========================= */
export type Emission = {
  id?: string;
  userId?: string;
  source: string;
  amount: number;
  date: string;
  facility?: string;
  notes?: string;
  createdAt?: string;
};

async function getEmissions(): Promise<Emission[]> {
  return request("/emissions");
}

async function createEmission(emission: Partial<Emission>) {
  return request("/emissions", {
    method: "POST",
    body: JSON.stringify(emission),
  });
}

async function deleteEmission(id: string) {
  return request(`/emissions/${id}`, { method: "DELETE" });
}

/* =========================
   ENERGY
========================= */
export type EnergyRecord = {
  id?: string;
  source: string;
  facility: string;
  consumption: number;
  date: string;
};

async function getEnergy(): Promise<EnergyRecord[]> {
  return request("/energy");
}

async function createEnergy(record: Partial<EnergyRecord>) {
  return request("/energy", {
    method: "POST",
    body: JSON.stringify(record),
  });
}

async function deleteEnergy(id: string) {
  return request(`/energy/${id}`, { method: "DELETE" });
}

/* =========================
   WATER
========================= */
export type WaterRecord = {
  id?: string;
  source: string;
  consumption: number;
  date: string;
  facility?: string;
  notes?: string;
};

async function getWater(): Promise<WaterRecord[]> {
  return request("/water");
}

async function createWater(record: Partial<WaterRecord>) {
  return request("/water", {
    method: "POST",
    body: JSON.stringify(record),
  });
}

async function deleteWater(id: string) {
  return request(`/water/${id}`, { method: "DELETE" });
}

/* =========================
   WASTE
========================= */
export type WasteRecord = {
  id?: string;
  date: string;
  type: string;
  facility?: string;
  amount: number;
};

async function getWaste(): Promise<WasteRecord[]> {
  return request("/waste");
}

async function createWaste(data: Partial<WasteRecord>) {
  return request("/waste", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

async function deleteWaste(id: string) {
  return request(`/waste/${id}`, { method: "DELETE" });
}

/* =========================
   SUPPLIERS
========================= */
export type Supplier = {
  id?: string;
  name: string;
  category: string;
  location?: string;
  carbonFootprint?: number;
  certifications?: string[];
  riskScore?: number;
  lastAssessment?: string;
};

async function getSuppliers(): Promise<Supplier[]> {
  return request("/suppliers");
}

async function createSupplier(data: Partial<Supplier>) {
  return request("/suppliers", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

async function assessSupplier(id: string) {
  return request(`/suppliers/${id}/assess`, { method: "PUT" });
}

async function deleteSupplier(id: string) {
  return request(`/suppliers/${id}`, { method: "DELETE" });
}

async function exportSuppliers() {
  return requestRaw("/suppliers/export");
}

/* =========================
   GOALS
========================= */
export type Goal = {
  id?: string;
  title: string;
  category: string;
  target: number;
  unit: string;
  deadline: string;
  progress: number;
  status: "on-track" | "at-risk" | "behind";
};

async function getGoals(): Promise<Goal[]> {
  return request("/goals");
}

async function createGoal(goal: Partial<Goal>) {
  return request("/goals", {
    method: "POST",
    body: JSON.stringify(goal),
  });
}

async function updateGoal(id: string, progress: number) {
  return request(`/goals/${id}`, {
    method: "PUT",
    body: JSON.stringify({ progress }),
  });
}

/* =========================
   COMPLIANCE
========================= */
export type ComplianceRecord = {
  id?: string;
  title: string;
  description: string;
  dueDate: string;
  status: string;
  lastAudit?: string | null;
};

async function getCompliance(): Promise<ComplianceRecord[]> {
  return request("/compliance");
}

async function createCompliance(record: Partial<ComplianceRecord>) {
  return request("/compliance", {
    method: "POST",
    body: JSON.stringify(record),
  });
}

async function updateCompliance(id: string, record: Partial<ComplianceRecord>) {
  return request(`/compliance/${id}`, {
    method: "PUT",
    body: JSON.stringify(record),
  });
}

async function deleteCompliance(id: string) {
  return request(`/compliance/${id}`, { method: "DELETE" });
}

async function getComplianceRecommendations() {
  return request("/compliance/recommendations");
}

/* =========================
   TEAMS
========================= */
async function getTeams() {
  return request("/teams");
}

async function createTeam(payload: any) {
  return request("/teams", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

async function updateTeam(id: string, payload: any) {
  return request(`/teams/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

async function deleteTeam(id: string) {
  return request(`/teams/${id}`, { method: "DELETE" });
}

async function filterTeams(projects: number) {
  return request(`/teams/filter?projects=${projects}`);
}

async function exportTeams() {
  return requestRaw("/teams/export");
}

/* =========================
   REPORTS
========================= */
export type Report = {
  id?: string;
  title: string;
  generated: string;
  type?: string;
  status?: string;
  emissions: number;
  renewableEnergy: number;
  waterUsage: number;
  wasteRecycled: number;
  downloads?: number;
};

export type AlertRecord = {
  id?: string;
  type: string;
  title: string;
  description: string;
  severity: "high" | "medium" | "low";
  affectedArea?: string;
  status: "active" | "investigating" | "pending_action" | "resolved";
  createdAt?: string;
};

export type RecommendationRecord = {
  id?: string;
  title: string;
  description: string;
  impact: string;
  savings: string;
  category: string;
  priority: "high" | "medium" | "low";
  createdAt?: string;
};

async function getReports(): Promise<Report[]> {
  return request("/reports");
}

async function generateReport(payload: Partial<Report>) {
  return request("/reports/generate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

async function exportReports() {
  return requestRaw("/reports/export");
}

async function downloadReport(id: string) {
  return requestRaw(`/reports/${id}/download`);
}

async function deleteReport(id: string) {
  return request(`/reports/${id}`, { method: "DELETE" });
}

/* =========================
   ALERTS
========================= */
async function getAlerts(): Promise<AlertRecord[]> {
  return request("/alerts");
}

async function checkAnomalies() {
  return request("/alerts/check-anomalies", { method: "POST" });
}

async function updateAlert(id: string, status: AlertRecord["status"]) {
  return request(`/alerts/${id}`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
}

/* =========================
   RECOMMENDATIONS
========================= */
async function getRecommendations(): Promise<RecommendationRecord[]> {
  return request("/recommendations");
}

const api = {
  getEmissions,
  createEmission,
  deleteEmission,
  getEnergy,
  createEnergy,
  deleteEnergy,
  getWater,
  createWater,
  deleteWater,
  getWaste,
  createWaste,
  deleteWaste,
  getSuppliers,
  createSupplier,
  assessSupplier,
  deleteSupplier,
  exportSuppliers,
  getGoals,
  createGoal,
  updateGoal,
  getCompliance,
  createCompliance,
  updateCompliance,
  deleteCompliance,
  getComplianceRecommendations,
  getTeams,
  createTeam,
  updateTeam,
  deleteTeam,
  filterTeams,
  exportTeams,
  getReports,
  generateReport,
  exportReports,
  downloadReport,
  deleteReport,
  getAlerts,
  checkAnomalies,
  updateAlert,
  getRecommendations,
};

export default api;