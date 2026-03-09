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

// 🔹 GET ALL ENERGY RECORDS
export async function getAllEnergy() {
  const res = await db.send(
    new ScanCommand({
      TableName: TABLE,
    })
  )

  return res.Items || []
}

// 🔹 CREATE ENERGY RECORD
export async function createEnergy(data: any) {
  const item = {
    id: uuidv4(),
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