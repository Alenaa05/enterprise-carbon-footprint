import { APIGatewayProxyHandler } from "aws-lambda";
import { db } from "../services/dynamo";
import {
  ScanCommand,
  PutCommand,
  DeleteCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { v4 as uuid } from "uuid";
import { getUserId } from "../utils/getUserId";

const TABLE = process.env.SUPPLIERS_TABLE!;

// GET SUPPLIERS (only for logged in user)
export const getSuppliers: APIGatewayProxyHandler = async (event) => {
  const userId = getUserId(event);

  const data = await db.send(
    new ScanCommand({
      TableName: TABLE,
      FilterExpression: "userId = :uid",
      ExpressionAttributeValues: {
        ":uid": userId,
      },
    }),
  );

  return {
    statusCode: 200,
    body: JSON.stringify(data.Items || []),
  };
};

// CREATE SUPPLIER
export const createSupplier: APIGatewayProxyHandler = async (event) => {
  const body = JSON.parse(event.body || "{}");

  const userId = getUserId(event);

  const item = {
    id: uuid(),
    userId,
    name: body.name,
    category: body.category,
    carbonFootprint: body.carbonFootprint || 0,
    certifications: body.certifications || [],
    riskScore: body.riskScore || 0,
    lastAssessment: new Date().toISOString().slice(0, 10),
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

// DELETE SUPPLIER
export const deleteSupplier: APIGatewayProxyHandler = async (event) => {
  const id = event.pathParameters?.id;

  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing supplier id" }),
    };
  }

  await db.send(
    new DeleteCommand({
      TableName: TABLE,
      Key: { id },
    }),
  );

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Supplier deleted" }),
  };
};

// ASSESS SUPPLIER (update risk score)
export const assessSupplier: APIGatewayProxyHandler = async (event) => {
  const id = event.pathParameters?.id;
  const body = JSON.parse(event.body || "{}");

  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing supplier id" }),
    };
  }

  const riskScore = body.riskScore || 0;

  await db.send(
    new UpdateCommand({
      TableName: TABLE,
      Key: { id },
      UpdateExpression: "SET riskScore = :r, lastAssessment = :d",
      ExpressionAttributeValues: {
        ":r": riskScore,
        ":d": new Date().toISOString().slice(0, 10),
      },
    }),
  );

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Assessment updated" }),
  };
};
