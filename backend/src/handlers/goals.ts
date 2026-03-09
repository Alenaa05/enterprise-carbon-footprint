import { APIGatewayProxyHandler } from "aws-lambda";
import { v4 as uuidv4 } from "uuid";
import { db } from "../services/dynamo";
import { ScanCommand, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const TABLE = process.env.GOALS_TABLE!;

export const getGoals: APIGatewayProxyHandler = async () => {
  try {
    const result = await db.send(
      new ScanCommand({
        TableName: TABLE,
      }),
    );

    return {
      statusCode: 200,
      body: JSON.stringify(result.Items || []),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to fetch goals" }),
    };
  }
};

export const createGoal: APIGatewayProxyHandler = async (event) => {
  const body = JSON.parse(event.body || "{}");

  const item = {
    id: uuidv4(),
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
};

export const updateGoal: APIGatewayProxyHandler = async (event) => {
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
};
