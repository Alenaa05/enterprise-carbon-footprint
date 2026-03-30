/**
 * alerts.ts handler
 *
 * Endpoints:
 * - GET /alerts
 * - POST /alerts/check-anomalies
 * - PUT /alerts/{id}
 */
import { APIGatewayProxyHandler } from "aws-lambda";
import { getUserId } from "../utils/getUserId";
import {
  ok,
  created,
  badRequest,
  notFound,
  unauthorized,
  serverError,
  isAuthError,
} from "../utils/response";
import {
  getAllAlerts,
  createAlert,
  updateAlertStatus,
} from "../services/alertsService";
import { detectAnomalies } from "../services/anomalyEngine";
import { getAllEmissions } from "../services/emissionsService";
import { getAllEnergy } from "../services/energyService";
import { getAllWater } from "../services/waterService";
import { getAllWaste } from "../services/wasteService";

export const getAlerts: APIGatewayProxyHandler = async (event) => {
  try {
    const userId = getUserId(event);
    const items = await getAllAlerts(userId);
    return ok(items);
  } catch (err: any) {
    console.error("getAlerts error:", err);
    return isAuthError(err) ? unauthorized(err.message) : serverError();
  }
};

export const checkAnomalies: APIGatewayProxyHandler = async (event) => {
  try {
    const userId = getUserId(event);

    const [emissions, energy, water, waste] = await Promise.all([
      getAllEmissions(userId),
      getAllEnergy(userId),
      getAllWater(userId),
      getAllWaste(userId),
    ]);

    const candidates = await detectAnomalies({
      emissions,
      energy,
      water,
      waste,
    });
    const createdAlerts = await Promise.all(
      candidates.map((a) =>
        createAlert(userId, {
          type: a.type,
          title: a.title,
          description: a.description,
          severity: a.severity,
          affectedArea: a.affectedArea,
          status: a.status,
        }),
      ),
    );

    return created({ created: createdAlerts.length, alerts: createdAlerts });
  } catch (err: any) {
    console.error("checkAnomalies error:", err);
    return isAuthError(err) ? unauthorized(err.message) : serverError();
  }
};

export const updateAlert: APIGatewayProxyHandler = async (event) => {
  try {
    const id = event.pathParameters?.id;
    if (!id) return badRequest("Missing id");
    if (!event.body) return badRequest("Missing request body");

    const userId = getUserId(event);
    const body = JSON.parse(event.body);
    const status = body.status;
    if (!status) return badRequest("Missing status");

    const updated = await updateAlertStatus(id, userId, status);
    return ok(updated);
  } catch (err: any) {
    console.error("updateAlert error:", err);
    if (err.message === "Not found") return notFound();
    return isAuthError(err) ? unauthorized(err.message) : serverError();
  }
};
