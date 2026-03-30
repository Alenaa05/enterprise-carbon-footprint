/**
 * recommendationsEngine.ts
 *
 * Recommendations generator with safe fallbacks:
 * - If `OPENAI_API_KEY` is configured, generate LLM-based recommendations.
 * - Otherwise, fall back to deterministic rule-based logic.
 */
import { RecommendationRecord } from "../models";
import { Emission, EnergyRecord, WaterRecord, WasteRecord } from "../models";
import { AI } from "../utils/env";
import https from "https";

type RecommendationCandidate = Omit<
  RecommendationRecord,
  "userId" | "id" | "createdAt"
>;

function generateRuleBased(input: {
  emissions: Emission[];
  energy: EnergyRecord[];
  water: WaterRecord[];
  waste: WasteRecord[];
}): RecommendationCandidate[] {
  const recs: RecommendationCandidate[] = [];

  const totalEnergy = input.energy.reduce(
    (s, r) => s + (r.consumption || 0),
    0,
  );
  const renewableEnergy = input.energy
    .filter((r) => r.source?.toLowerCase().includes("renewable"))
    .reduce((s, r) => s + (r.consumption || 0), 0);
  const renewablePct =
    totalEnergy > 0 ? (renewableEnergy / totalEnergy) * 100 : 0;

  const totalWater = input.water.reduce((s, r) => s + (r.consumption || 0), 0);
  const totalWaste = input.waste.reduce((s, r) => s + (r.amount || 0), 0);
  const recycledWaste = input.waste
    .filter((r: any) => (r.type || "").toLowerCase() === "recycled")
    .reduce((s, r) => s + (r.amount || 0), 0);
  const recycleRate = totalWaste > 0 ? (recycledWaste / totalWaste) * 100 : 0;

  if (renewablePct < 40 && totalEnergy > 0) {
    recs.push({
      title: "Increase Renewable Energy Procurement",
      description:
        "Renewable share is below 40%. Consider adding renewable contracts or on-site generation to improve the mix.",
      impact: "High",
      savings: "Reduced Scope 2 emissions",
      category: "Energy",
      priority: "high",
    });
  }

  if (totalWater > 0) {
    recs.push({
      title: "Deploy Water Efficiency Program",
      description:
        "Monitor high-usage facilities and add leak detection plus low-flow upgrades to reduce consumption.",
      impact: "Medium",
      savings: "Lower water consumption",
      category: "Water",
      priority: "medium",
    });
  }

  if (recycleRate < 60 && totalWaste > 0) {
    recs.push({
      title: "Improve Waste Segregation & Recycling",
      description:
        "Recycling rate is below 60%. Improve segregation training and partner with certified recyclers.",
      impact: "Medium",
      savings: "Reduced landfill waste",
      category: "Waste",
      priority: "medium",
    });
  }

  // Carbon: surface top source
  const bySource: Record<string, number> = {};
  input.emissions.forEach((e) => {
    if (!e.source) return;
    bySource[e.source] = (bySource[e.source] || 0) + (e.amount || 0);
  });
  const top = Object.entries(bySource).sort((a, b) => b[1] - a[1])[0];
  if (top) {
    recs.push({
      title: `Target largest emissions source: ${top[0]}`,
      description:
        "Focus decarbonization initiatives on your largest emissions source to achieve the fastest impact.",
      impact: "High",
      savings: "kg CO₂e reduction potential",
      category: "Carbon",
      priority: "high",
    });
  }

  // Keep list small and prioritized
  return recs.slice(0, 5);
}

function postOpenAIChatCompletions(payload: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const req = https.request(
      {
        method: "POST",
        hostname: "api.openai.com",
        path: "/v1/chat/completions",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${AI.OPENAI_API_KEY}`,
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (c) => chunks.push(Buffer.from(c)));
        res.on("end", () => {
          const text = Buffer.concat(chunks).toString("utf8");
          if (res.statusCode && res.statusCode >= 400) {
            return reject(new Error(`OpenAI error ${res.statusCode}: ${text}`));
          }
          try {
            resolve(text ? JSON.parse(text) : {});
          } catch {
            reject(new Error("OpenAI returned non-JSON response"));
          }
        });
      },
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

async function tryGenerateWithLLM(input: {
  emissions: Emission[];
  energy: EnergyRecord[];
  water: WaterRecord[];
  waste: WasteRecord[];
}): Promise<RecommendationCandidate[] | null> {
  if (!AI.OPENAI_API_KEY) return null;

  // Keep payload small: send summary + a few top drivers.
  const totalEmissions = input.emissions.reduce(
    (s, r) => s + (r.amount || 0),
    0,
  );
  const totalEnergy = input.energy.reduce(
    (s, r) => s + (r.consumption || 0),
    0,
  );
  const renewableEnergy = input.energy
    .filter((r) => r.source?.toLowerCase().includes("renewable"))
    .reduce((s, r) => s + (r.consumption || 0), 0);
  const renewablePct =
    totalEnergy > 0 ? Math.round((renewableEnergy / totalEnergy) * 100) : 0;
  const totalWater = input.water.reduce((s, r) => s + (r.consumption || 0), 0);
  const totalWaste = input.waste.reduce((s, r) => s + (r.amount || 0), 0);

  const bySource: Record<string, number> = {};
  input.emissions.forEach((e) => {
    if (!e.source) return;
    bySource[e.source] = (bySource[e.source] || 0) + (e.amount || 0);
  });
  const topSources = Object.entries(bySource)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([source, amount]) => ({ source, amount }));

  const schemaHint = `Return JSON ONLY with shape: {"recommendations":[{"title":string,"description":string,"impact":string,"savings":string,"category":"Carbon"|"Energy"|"Water"|"Waste"|"Compliance","priority":"high"|"medium"|"low"}]}`;

  try {
    const resp = await postOpenAIChatCompletions({
      model: AI.OPENAI_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a sustainability analyst generating practical, high-ROI recommendations. Keep it specific and actionable. No fluff.",
        },
        {
          role: "user",
          content: `${schemaHint}\n\nSnapshot: totalEmissionsKgCO2e=${Math.round(totalEmissions)}, totalEnergyKwh=${Math.round(totalEnergy)}, renewablePct=${renewablePct}, totalWaterLiters=${Math.round(totalWater)}, totalWasteKg=${Math.round(totalWaste)}.\n\nTop emission sources: ${JSON.stringify(topSources)}.`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 600,
    });

    const text = resp?.choices?.[0]?.message?.content || "";
    const parsed = text ? JSON.parse(text) : null;
    const recs = parsed?.recommendations;
    if (Array.isArray(recs)) return recs as RecommendationCandidate[];
    return null;
  } catch (e) {
    console.warn("LLM recommendations failed; falling back", e);
    return null;
  }
}

export async function generateRecommendationsFromData(input: {
  emissions: Emission[];
  energy: EnergyRecord[];
  water: WaterRecord[];
  waste: WasteRecord[];
}): Promise<RecommendationCandidate[]> {
  const llm = await tryGenerateWithLLM(input);
  if (llm && llm.length) return llm.slice(0, 5);
  return generateRuleBased(input);
}
