import { PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { db } from "../services/dynamo";
import { TABLES, CORS } from "../utils/env";
import { v4 as uuid } from "uuid";
import { getOrganizationId } from "../utils/getUserId";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": CORS.ORIGIN,
  "Access-Control-Allow-Credentials": "true",
  "Content-Type": "application/json",
};

export const getEmissions = async (event: any) => {
  try {
    const organizationId = getOrganizationId(event);

    const result = await db.send(
      new ScanCommand({
        TableName: TABLES.EMISSIONS,
        FilterExpression:
          "attribute_not_exists(organizationId) OR organizationId = :orgId",
        ExpressionAttributeValues: {
          ":orgId": organizationId,
        },
      })
    );

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify(result.Items || []),
    };
  } catch (err) {
    console.error("getEmissions error:", err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};

export const createEmission = async (event: any) => {
  try {
    if (!event || !event.body) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ message: "Missing request body" }),
      };
    }

    const body = JSON.parse(event.body);
    const organizationId = getOrganizationId(event);

    const item = {
      id: uuid(),
      organizationId,
      ...body,
      createdAt: new Date().toISOString(),
    };

    await db.send(
      new PutCommand({
        TableName: TABLES.EMISSIONS,
        Item: item,
      })
    );

    return {
      statusCode: 201,
      headers: CORS_HEADERS,
      body: JSON.stringify(item),
    };
  } catch (err) {
    console.error("createEmission error:", err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};