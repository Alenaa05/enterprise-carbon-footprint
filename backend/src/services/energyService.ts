import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb"
import { v4 as uuidv4 } from "uuid"

const REGION = process.env.AWS_REGION || "ap-south-1"
const TABLE = process.env.ENERGY_TABLE || "EnergyTable"

const client = new DynamoDBClient({ region: REGION })
const db = DynamoDBDocumentClient.from(client)

// 🔹 GET ALL ENERGY RECORDS (optionally filtered by organization)
export async function getAllEnergy(organizationId?: string | null) {
  const res = await db.send(
    new ScanCommand({
      TableName: TABLE,
      FilterExpression: organizationId
        ? "attribute_not_exists(organizationId) OR organizationId = :orgId"
        : undefined,
      ExpressionAttributeValues: organizationId
        ? {
            ":orgId": organizationId,
          }
        : undefined,
    })
  )

  return res.Items || []
}

// 🔹 CREATE ENERGY RECORD
export async function createEnergy(data: any) {
  const item = {
    id: uuidv4(),
    organizationId: data.organizationId ?? null,
    source: data.source,
    facility: data.facility,
    consumption: data.consumption,
    cost: data.cost,
    date: data.date,
    createdAt: new Date().toISOString(),
  }

  await db.send(
    new PutCommand({
      TableName: TABLE,
      Item: item,
    })
  )

  return item
}

// 🔹 DELETE ENERGY RECORD
export async function deleteEnergy(id: string) {
  await db.send(
    new DeleteCommand({
      TableName: TABLE,
      Key: { id },
    })
  )

  return { success: true }
}

