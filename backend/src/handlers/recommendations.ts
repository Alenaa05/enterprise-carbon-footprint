/**
 * recommendations.ts handler
 *
 * Endpoints:
 * - GET /recommendations
 *
 * Returns stored recommendations if fresh (< 1 hour old).
 * Regenerates from current data and stores when stale or empty.
 */
import { APIGatewayProxyHandler } from "aws-lambda";
import { getUserId } from "../utils/getUserId";
import { ok, unauthorized, serverError, isAuthError } from "../utils/response";
import { getAllEmissions } from "../services/emissionsService";
import { getAllEnergy } from "../services/energyService";
import { getAllWater } from "../services/waterService";
import { getAllWaste } from "../services/wasteService";
import { generateRecommendationsFromData } from "../services/recommendationsEngine";
import {
  getStoredRecommendations,
  storeRecommendations,
} from "../services/recommendationsService";

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export const getRecommendations: APIGatewayProxyHandler = async (event) => {
  try {
    const userId = getUserId(event);

    // Return stored recommendations if they are fresh
    const stored = await getStoredRecommendations(userId);
    if (stored.length > 0) {
      const latestCreatedAt = new Date(stored[0].createdAt).getTime();
      const age = Date.now() - latestCreatedAt;
      if (age < CACHE_TTL_MS) {
        return ok(stored);
      }
    }

    // Stale or empty — regenerate from current data
    const [emissions, energy, water, waste] = await Promise.all([
      getAllEmissions(userId),
      getAllEnergy(userId),
      getAllWater(userId),
      getAllWaste(userId),
    ]);

    const recs = await generateRecommendationsFromData({
      emissions,
      energy,
      water,
      waste,
    });

    const fresh = await storeRecommendations(userId, recs);
    return ok(fresh);
  } catch (err: any) {
    console.error("getRecommendations error:", err);
    return isAuthError(err) ? unauthorized(err.message) : serverError();
  }
};

