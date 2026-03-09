import { APIGatewayProxyHandler } from "aws-lambda";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { v4 as uuid } from "uuid";

const client = new DynamoDBClient({});
const db = DynamoDBDocumentClient.from(client);
const TABLE = process.env.WASTE_TABLE!;

export const getWaste: APIGatewayProxyHandler = async () => {
  const data = await db.send(new ScanCommand({ TableName: TABLE }));
  return {
    statusCode: 200,
    body: JSON.stringify(data.Items || []),
  };
};

export const createWaste: APIGatewayProxyHandler = async (event) => {
  const body = JSON.parse(event.body || "{}");

  const item = {
    id: uuid(),
    date: body.date,
    type: body.type,
    facility: body.facility,
    amount: body.amount,
    createdAt: new Date().toISOString(),
  };

  await db.send(new PutCommand({ TableName: TABLE, Item: item }));

  return {
    statusCode: 200,
    body: JSON.stringify(item),
  };
};

export const deleteWaste: APIGatewayProxyHandler = async (event) => {
  const id = event.pathParameters?.id;

  await db.send(
    new DeleteCommand({
      TableName: TABLE,
      Key: { id },
    }),
  );

  return { statusCode: 200, body: JSON.stringify({ success: true }) };
};
