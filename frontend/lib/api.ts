// Frontend API client for calling backend endpoints

export type Emission = {
  id?: string;
  organizationId?: string;
  source: string;
  amount: number;
  date: string;
  facility?: string;
  notes?: string;
  createdAt?: string;
};

// const API_BASE = "https://9rqq788edc.execute-api.ap-south-1.amazonaws.com/dev";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;

function getToken() {
  return localStorage.getItem("token");
}

async function request(path: string, options: any = {}) {
  const token = getToken();

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `API error ${res.status}`);
  }

  return res.json();
}

/* =========================
   EMISSIONS
========================= */

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
  return request(`/emissions/${id}`, {
    method: "DELETE",
  });
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
  return request(`/energy/${id}`, {
    method: "DELETE",
  });
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
  return request(`/water/${id}`, {
    method: "DELETE",
  });
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
  return request(`/waste/${id}`, {
    method: "DELETE",
  });
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
  return request(`/suppliers/${id}/assess`, {
    method: "PUT",
  });
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
   EXPORT API
========================= */

export default {
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
  getGoals,
  createGoal,
  updateGoal,
};
