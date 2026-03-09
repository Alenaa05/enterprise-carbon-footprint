import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || process.env.AWS_REGION || "ap-south-1",
});

export const db = DynamoDBDocumentClient.from(client);

// helper: put item
export const putItem = async (table: string, item: any) => {
  return db.send({
    // using low-level send with PutCommand is preferred; keep db usage in handlers
  } as any);
};