/**
 * alertsService.ts
 *
 * Stores and retrieves anomaly alerts.
 * Table key schema: userId (HASH) + id (RANGE)
 */
import {
  QueryCommand,
  PutCommand,
  UpdateCommand,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";
import { v4 as uuid } from "uuid";
import { db } from "./dynamo";
import { TABLES } from "../utils/env";
import { AlertRecord, AlertSeverity, AlertStatus } from "../models";

const TABLE = TABLES.ALERTS;

export async function getAllAlerts(userId: string): Promise<AlertRecord[]> {
  const res = await db.send(
    new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: "userId = :uid",
      ExpressionAttributeValues: { ":uid": userId },
    }),
  );
  const items = (res.Items || []) as AlertRecord[];
  return items.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export async function createAlert(
  userId: string,
  data: Omit<AlertRecord, "userId" | "id" | "createdAt"> & {
    severity: AlertSeverity;
    status: AlertStatus;
  },
): Promise<AlertRecord> {
  const item: AlertRecord = {
    userId,
    id: uuid(),
    type: data.type,
    title: data.title,
    description: data.description,
    severity: data.severity,
    affectedArea: data.affectedArea,
    status: data.status,
    createdAt: new Date().toISOString(),
  };

  await db.send(new PutCommand({ TableName: TABLE, Item: item }));
  return item;
}

export async function updateAlertStatus(
  id: string,
  userId: string,
  status: AlertStatus,
): Promise<AlertRecord> {
  const existing = await db.send(
    new GetCommand({ TableName: TABLE, Key: { userId, id } }),
  );
  if (!existing.Item) throw new Error("Not found");

  const res = await db.send(
    new UpdateCommand({
      TableName: TABLE,
      Key: { userId, id },
      UpdateExpression: "SET #status = :s",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: { ":s": status },
      ReturnValues: "ALL_NEW",
    }),
  );

  return res.Attributes as AlertRecord;
}

