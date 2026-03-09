import { APIGatewayProxyHandler } from "aws-lambda";
import { db } from "../services/dynamo";
import {
  ScanCommand,
  PutCommand,
  DeleteCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { v4 as uuid } from "uuid";
import { getUserId, getOrganizationId } from "../utils/getUserId";

const TABLE = process.env.SUPPLIERS_TABLE!;

// GET SUPPLIERS (for org, scoped to current user id)
export const getSuppliers: APIGatewayProxyHandler = async (event) => {
  const userId = getUserId(event);
  const organizationId = getOrganizationId(event);

  const data = await db.send(
    new ScanCommand({
      TableName: TABLE,
      FilterExpression:
        "(attribute_not_exists(organizationId) OR organizationId = :orgId) AND userId = :uid",
      ExpressionAttributeValues: {
        ":uid": userId,
        ":orgId": organizationId,
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
  const organizationId = getOrganizationId(event);

  const item = {
    id: uuid(),
    userId,
    organizationId,
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

// EXPORT SUPPLIERS (CSV)
export const exportSuppliers: APIGatewayProxyHandler = async (event) => {
  try {
    const userId = getUserId(event);
    const organizationId = getOrganizationId(event);

    const data = await db.send(
      new ScanCommand({
        TableName: TABLE,
        FilterExpression:
          "(attribute_not_exists(organizationId) OR organizationId = :orgId) AND userId = :uid",
        ExpressionAttributeValues: {
          ":uid": userId,
          ":orgId": organizationId,
        },
      }),
    );

    const items: any[] = data.Items || [];

    const headers = [
      "name",
      "category",
      "location",
      "carbonFootprint",
      "certifications",
      "riskScore",
      "lastAssessment",
    ];

    const csv = [
      headers.join(","),
      ...items.map((s) =>
        [
          s.name ?? "",
          s.category ?? "",
          s.location ?? "",
          s.carbonFootprint ?? 0,
          Array.isArray(s.certifications) ? s.certifications.join("|") : "",
          s.riskScore ?? 0,
          s.lastAssessment ?? "",
        ]
          .map((v) => `"${String(v).replaceAll('"', '""')}"`)
          .join(","),
      ),
    ].join("\n");

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=suppliers.csv",
        "Access-Control-Allow-Origin": "*",
      },
      body: csv,
    };
  } catch (err) {
    console.error("exportSuppliers error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to export suppliers" }),
    };
  }
};
