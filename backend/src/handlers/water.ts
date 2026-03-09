import { APIGatewayProxyHandler } from "aws-lambda";
import { v4 as uuidv4 } from "uuid";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const db = DynamoDBDocumentClient.from(client);

const TABLE = process.env.WATER_TABLE!;

export const getWater: APIGatewayProxyHandler = async () => {
  const data = await db.send(new ScanCommand({ TableName: TABLE }));
  return {
    statusCode: 200,
    body: JSON.stringify(data.Items || []),
  };
};

export const createWater: APIGatewayProxyHandler = async (event) => {
  const body = JSON.parse(event.body || "{}");

  const item = {
    id: uuidv4(),
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
};

export const deleteWater: APIGatewayProxyHandler = async (event) => {
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
};
