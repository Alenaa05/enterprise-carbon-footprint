/**
 * anomalyEngine.ts
 *
 * Anomaly detection with safe fallbacks:
 * - If `ANOMALY_MODEL_URL` is configured, call the external ML service.
 * - Otherwise, run a deterministic rule-based engine (Lambda-safe).
 */
import { AlertRecord } from "../models";
import { Emission } from "../models";
import { EnergyRecord } from "../models";
import { WaterRecord } from "../models";
import { WasteRecord } from "../models";
import { AI } from "../utils/env";
import https from "https";

type AlertCandidate = Omit<AlertRecord, "userId" | "id" | "createdAt">;

function monthKey(date: string) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function sumByMonth<T extends { date: string }>(
  rows: T[],
  valueFn: (r: T) => number,
) {
  const map: Record<string, number> = {};
  for (const r of rows) {
    const key = monthKey(r.date);
    if (!key) continue;
    map[key] = (map[key] || 0) + valueFn(r);
  }
  return map;
}

function latestTwoMonths(map: Record<string, number>) {
  const keys = Object.keys(map).sort();
  if (keys.length < 2) return null;
  const prev = keys[keys.length - 2];
  const curr = keys[keys.length - 1];
  return { prevKey: prev, currKey: curr, prev: map[prev], curr: map[curr] };
}

function detectAnomaliesRuleBased(input: {
  emissions: Emission[];
  energy: EnergyRecord[];
  water: WaterRecord[];
  waste: WasteRecord[];
}): AlertCandidate[] {
  const alerts: AlertCandidate[] = [];

  // Emissions spike > 30% month-over-month
  const emMap = sumByMonth(input.emissions, (e) => Number(e.amount || 0));
  const em2 = latestTwoMonths(emMap);
  if (em2 && em2.prev > 0) {
    const pct = ((em2.curr - em2.prev) / em2.prev) * 100;
    if (pct > 30) {
      alerts.push({
        type: "emissions_spike",
        title: "Emissions Spike Detected",
        description: `Carbon emissions increased ${pct.toFixed(
          0,
        )}% compared to last month (${em2.prevKey} → ${em2.currKey}).`,
        severity: "high",
        affectedArea: "Emissions",
        status: "active",
      });
    }
  }

  // Water deviation > 20% month-over-month
  const wMap = sumByMonth(input.water, (r) => Number(r.consumption || 0));
  const w2 = latestTwoMonths(wMap);
  if (w2 && w2.prev > 0) {
    const pct = ((w2.curr - w2.prev) / w2.prev) * 100;
    if (pct > 20) {
      alerts.push({
        type: "water_deviation",
        title: "Water Usage Deviation",
        description: `Water consumption increased ${pct.toFixed(
          0,
        )}% compared to last month (${w2.prevKey} → ${w2.currKey}).`,
        severity: "medium",
        affectedArea: "Water",
        status: "pending_action",
      });
    }
  }

  // Energy anomaly > 25% month-over-month
  const enMap = sumByMonth(input.energy, (r) => Number(r.consumption || 0));
  const en2 = latestTwoMonths(enMap);
  if (en2 && en2.prev > 0) {
    const pct = ((en2.curr - en2.prev) / en2.prev) * 100;
    if (pct > 25) {
      alerts.push({
        type: "energy_anomaly",
        title: "Unusual Energy Pattern",
        description: `Energy consumption increased ${pct.toFixed(
          0,
        )}% compared to last month (${en2.prevKey} → ${en2.currKey}).`,
        severity: "medium",
        affectedArea: "Energy",
        status: "investigating",
      });
    }
  }

  // Waste anomaly > 30% month-over-month
  const wsMap = sumByMonth(input.waste, (r) => Number(r.amount || 0));
  const ws2 = latestTwoMonths(wsMap);
  if (ws2 && ws2.prev > 0) {
    const pct = ((ws2.curr - ws2.prev) / ws2.prev) * 100;
    if (pct > 30) {
      alerts.push({
        type: "waste_anomaly",
        title: "Waste Spike Detected",
        description: `Waste increased ${pct.toFixed(
          0,
        )}% compared to last month (${ws2.prevKey} → ${ws2.currKey}).`,
        severity: "low",
        affectedArea: "Waste",
        status: "active",
      });
    }
  }

  return alerts;
}

function postJson(url: string, payload: unknown): Promise<any> {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const body = JSON.stringify(payload);

    const req = https.request(
      {
        method: "POST",
        hostname: u.hostname,
        path: `${u.pathname}${u.search}`,
        port: u.port ? Number(u.port) : u.protocol === "https:" ? 443 : 80,
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (c) => chunks.push(Buffer.from(c)));
        res.on("end", () => {
          const text = Buffer.concat(chunks).toString("utf8");
          if (res.statusCode && res.statusCode >= 400) {
            return reject(
              new Error(`ML service error ${res.statusCode}: ${text}`),
            );
          }
          try {
            resolve(text ? JSON.parse(text) : {});
          } catch (e) {
            reject(new Error("ML service returned non-JSON response"));
          }
        });
      },
    );

    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

export async function detectAnomalies(input: {
  emissions: Emission[];
  energy: EnergyRecord[];
  water: WaterRecord[];
  waste: WasteRecord[];
}): Promise<AlertCandidate[]> {
  if (AI.ANOMALY_MODEL_URL) {
    try {
      const resp = await postJson(AI.ANOMALY_MODEL_URL, {
        emissions: input.emissions,
        energy: input.energy,
        water: input.water,
        waste: input.waste,
      });
      const alerts = resp?.alerts;
      if (Array.isArray(alerts)) return alerts as AlertCandidate[];
      // If the service is misconfigured, fall back.
      console.warn("ML anomaly service returned unexpected shape");
    } catch (e) {
      console.warn("ML anomaly service failed; falling back", e);
    }
  }

  return detectAnomaliesRuleBased(input);
}
