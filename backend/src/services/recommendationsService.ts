/**
 * recommendationsService.ts
 *
 * Generates and stores sustainability recommendations (rule-based placeholder).
 * Table key schema: userId (HASH) + id (RANGE)
 */
import { QueryCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuid } from "uuid";
import { db } from "./dynamo";
import { TABLES } from "../utils/env";
import { RecommendationRecord } from "../models";

const TABLE = TABLES.RECOMMENDATIONS;

export async function getStoredRecommendations(
  userId: string,
): Promise<RecommendationRecord[]> {
  const res = await db.send(
    new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: "userId = :uid",
      ExpressionAttributeValues: { ":uid": userId },
    }),
  );
  const items = (res.Items || []) as RecommendationRecord[];
  return items.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export async function storeRecommendations(
  userId: string,
  recs: Omit<RecommendationRecord, "userId" | "id" | "createdAt">[],
): Promise<RecommendationRecord[]> {
  const now = new Date().toISOString();
  const items: RecommendationRecord[] = recs.map((r) => ({
    userId,
    id: uuid(),
    createdAt: now,
    ...r,
  }));

  await Promise.all(
    items.map((item) => db.send(new PutCommand({ TableName: TABLE, Item: item }))),
  );

  return items;
}

