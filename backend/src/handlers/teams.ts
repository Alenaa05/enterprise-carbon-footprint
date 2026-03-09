import { ScanCommand, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

import { db } from "../services/dynamo";
import { v4 as uuid } from "uuid";

const TABLE = process.env.TEAMS_TABLE!;

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json",
};

/* ---------------- GET TEAMS ---------------- */

export const getTeams = async () => {
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
};

/* ---------------- CREATE TEAM ---------------- */

export const createTeam = async (event: any) => {
  const body = JSON.parse(event.body);

  const item = {
    id: uuid(),
    name: body.name,
    lead: body.lead,
    members: body.members,
    responsibilities: body.responsibilities,
    projectsActive: Number(body.projectsActive || 0),
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
};

/* ---------------- UPDATE TEAM ---------------- */

export const updateTeam = async (event: any) => {
  const id = event.pathParameters.id;
  const body = JSON.parse(event.body);

  const result = await db.send(
    new UpdateCommand({
      TableName: TABLE,
      Key: { id },

      UpdateExpression:
        "SET #name=:name, #lead=:lead, members=:members, responsibilities=:resp, projectsActive=:projects",

      ExpressionAttributeNames: {
        "#name": "name",
        "#lead": "lead",
      },

      ExpressionAttributeValues: {
        ":name": body.name,
        ":lead": body.lead,
        ":members": body.members,
        ":resp": body.responsibilities,
        ":projects": Number(body.projectsActive),
      },

      ReturnValues: "ALL_NEW",
    }),
  );

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(result.Attributes),
  };
};
/* ---------------- FILTER TEAMS ---------------- */

export const filterTeams = async (event: any) => {
  const projects = Number(event.queryStringParameters?.projects || 0);

  const result = await db.send(
    new ScanCommand({
      TableName: TABLE,
    }),
  );

  let items: any = result.Items || [];

  if (projects > 0) {
    items = items.filter((t: any) => t.projectsActive >= projects);
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(items),
  };
};

/* ---------------- EXPORT TEAMS ---------------- */

export const exportTeams = async () => {
  const result = await db.send(
    new ScanCommand({
      TableName: TABLE,
    }),
  );

  const csv = (result.Items || [])
    .map((t: any) => `${t.name},${t.lead},${t.members},${t.projectsActive}`)
    .join("\n");

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=teams.csv",
    },
    body: csv,
  };
};
