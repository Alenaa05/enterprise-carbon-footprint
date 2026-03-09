import { APIGatewayProxyHandler } from "aws-lambda";
import { v4 as uuidv4 } from "uuid";
import { db } from "../services/dynamo";
import { ScanCommand, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { getOrganizationId } from "../utils/getUserId";

const TABLE = process.env.GOALS_TABLE!;

export const getGoals: APIGatewayProxyHandler = async (event) => {
  try {
    const organizationId = getOrganizationId(event);

    const result = await db.send(
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
      body: JSON.stringify(result.Items || []),
    };
  } catch (err) {
    console.error("getGoals error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to fetch goals" }),
    };
  }
};

export const createGoal: APIGatewayProxyHandler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const organizationId = getOrganizationId(event);

    const item = {
      id: uuidv4(),
      organizationId,
      title: body.title,
      category: body.category,
      target: body.target,
      unit: body.unit,
      deadline: body.deadline,
      progress: 0,
      status: "on-track",
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
    console.error("createGoal error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to create goal" }),
    };
  }
};

export const updateGoal: APIGatewayProxyHandler = async (event) => {
  try {
    const id = event.pathParameters?.id;
    const body = JSON.parse(event.body || "{}");

    await db.send(
      new UpdateCommand({
        TableName: TABLE,
        Key: { id },
        UpdateExpression: "set progress = :p",
        ExpressionAttributeValues: {
          ":p": body.progress,
        },
      }),
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Goal updated" }),
    };
  } catch (err) {
    console.error("updateGoal error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to update goal" }),
    };
  }
};
