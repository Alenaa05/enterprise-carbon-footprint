import { APIGatewayProxyHandler } from "aws-lambda";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { v4 as uuid } from "uuid";
import { getOrganizationId } from "../utils/getUserId";

const client = new DynamoDBClient({});
const db = DynamoDBDocumentClient.from(client);
const TABLE = process.env.WASTE_TABLE!;

export const getWaste: APIGatewayProxyHandler = async (event) => {
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
    console.error("getWaste error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to fetch waste records" }),
    };
  }
};

export const createWaste: APIGatewayProxyHandler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const organizationId = getOrganizationId(event);

    const item = {
      id: uuid(),
      organizationId,
      date: body.date,
      type: body.type,
      facility: body.facility,
      amount: body.amount,
      disposalMethod: body.disposalMethod,
      createdAt: new Date().toISOString(),
    };

    await db.send(new PutCommand({ TableName: TABLE, Item: item }));

    return {
      statusCode: 200,
      body: JSON.stringify(item),
    };
  } catch (err) {
    console.error("createWaste error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to create waste record" }),
    };
  }
};

export const deleteWaste: APIGatewayProxyHandler = async (event) => {
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
    console.error("deleteWaste error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to delete waste record" }),
    };
  }
};
