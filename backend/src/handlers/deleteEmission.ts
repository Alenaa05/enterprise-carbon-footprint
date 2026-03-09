import { APIGatewayProxyHandler } from "aws-lambda"
import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient, DeleteCommand } from "@aws-sdk/lib-dynamodb"
import { TABLES } from "../utils/env"   // 👈 use shared env config

const client = new DynamoDBClient({ region: process.env.AWS_REGION })
const db = DynamoDBDocumentClient.from(client)

const TABLE = TABLES.EMISSIONS   // 👈 this is the key fix

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const id = event.pathParameters?.id

    if (!id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing id" }),
      }
    }

    await db.send(
      new DeleteCommand({
        TableName: TABLE,
        Key: { id },
      })
    )

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Deleted successfully" }),
    }
  } catch (err) {
    console.error(err)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Delete failed" }),
    }
  }
}