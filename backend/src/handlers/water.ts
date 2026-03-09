import { APIGatewayProxyHandler } from "aws-lambda";
import { v4 as uuidv4 } from "uuid";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { getOrganizationId } from "../utils/getUserId";

const client = new DynamoDBClient({});
const db = DynamoDBDocumentClient.from(client);

const TABLE = process.env.WATER_TABLE!;

export const getWater: APIGatewayProxyHandler = async (event) => {
  try {
    const organizationId = getOrganizationId(event);

    const data = await db.send(
      new ScanCommand({
        TableName: TABLE,
        FilterExpression:
          "attribute_not_exists(organizationId) OR organizationId = :orgId",
        ExpressionAttributeValues: {
          ":orgId": organizationId,
        },
      }),
    );

    return {
      statusCode: 200,
      body: JSON.stringify(data.Items || []),
    };
  } catch (err) {
    console.error("getWater error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to fetch water records" }),
    };
  }
};

export const createWater: APIGatewayProxyHandler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const organizationId = getOrganizationId(event);

    const item = {
      id: uuidv4(),
      organizationId,
      source: body.source,
      consumption: body.consumption,
      date: body.date,
      facility: body.facility,
      notes: body.notes,
      createdAt: new Date().toISOString(),
    };

    await db.send(
      new PutCommand({
        TableName: TABLE,
        Item: item,
      }),
    );

    return {
      statusCode: 201,
      body: JSON.stringify(item),
    };
  } catch (err) {
    console.error("createWater error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to create water record" }),
    };
  }
};

export const deleteWater: APIGatewayProxyHandler = async (event) => {
  try {
    const id = event.pathParameters?.id;

    if (!id) {
      return { statusCode: 400, body: "Missing id" };
    }

    await db.send(
      new DeleteCommand({
        TableName: TABLE,
        Key: { id },
      }),
    );

    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (err) {
    console.error("deleteWater error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to delete water record" }),
    };
  }
};
