import {
  ScanCommand,
  PutCommand,
  DeleteCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

import { db } from "../services/dynamo";
import { v4 as uuid } from "uuid";
import { generateRecommendations } from "../services/openai";

const TABLE = process.env.COMPLIANCE_TABLE!;

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true,
  "Content-Type": "application/json",
};

/* ---------------- GET ALL ---------------- */

export const getCompliance = async () => {
  try {
    const result = await db.send(
      new ScanCommand({
        TableName: TABLE,
      }),
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result.Items || []),
    };
  } catch (err) {
    console.error("getCompliance error:", err);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: "Failed to fetch regulations" }),
    };
  }
};

/* ---------------- CREATE ---------------- */

export const createCompliance = async (event: any) => {
  try {
    const body = JSON.parse(event.body || "{}");

    const item = {
      id: uuid(),
      title: body.title,
      description: body.description,
      dueDate: body.dueDate,
      lastAudit: body.lastAudit || null,
      status: body.status || "Pending",
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
      headers,
      body: JSON.stringify(item),
    };
  } catch (err) {
    console.error("createCompliance error:", err);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: "Failed to create regulation" }),
    };
  }
};

/* ---------------- DELETE ---------------- */

export const deleteCompliance = async (event: any) => {
  try {
    const id = event.pathParameters.id;

    await db.send(
      new DeleteCommand({
        TableName: TABLE,
        Key: { id },
      }),
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: "Deleted" }),
    };
  } catch (err) {
    console.error("deleteCompliance error:", err);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: "Delete failed" }),
    };
  }
};

/* ---------------- UPDATE ---------------- */

export const updateCompliance = async (event: any) => {
  try {
    const id = event.pathParameters.id;
    const body = JSON.parse(event.body);

    const result = await db.send(
      new UpdateCommand({
        TableName: TABLE,
        Key: { id },
        UpdateExpression:
          "SET title = :t, description = :d, dueDate = :du, status = :s, lastAudit = :la",
        ExpressionAttributeValues: {
          ":t": body.title,
          ":d": body.description,
          ":du": body.dueDate,
          ":s": body.status,
          ":la": body.lastAudit,
        },
        ReturnValues: "ALL_NEW",
      }),
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result.Attributes),
    };
  } catch (err) {
    console.error("updateCompliance error:", err);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: "Failed to update regulation" }),
    };
  }
};

/* ---------------- AI RECOMMENDATIONS ---------------- */

export const getRecommendations = async () => {
  try {
    const result = await db.send(
      new ScanCommand({
        TableName: TABLE,
      }),
    );

    const advice = await generateRecommendations(result.Items || []);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        advice,
      }),
    };
  } catch (err) {
    console.error("getRecommendations error:", err);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        message: "Failed to generate AI insights",
      }),
    };
  }
};
