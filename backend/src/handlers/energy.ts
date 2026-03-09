import { APIGatewayProxyHandler } from "aws-lambda"
import {
  getAllEnergy,
  createEnergy,
  deleteEnergy,
} from "../services/energyService"

// 🔹 GET /energy
export const getEnergy: APIGatewayProxyHandler = async () => {
  try {
    const items = await getAllEnergy()

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(items),
    }
  } catch (err) {
    console.error("getEnergy error:", err)

    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error" }),
    }
  }
}

// 🔹 POST /energy
export const createEnergyRecord: APIGatewayProxyHandler = async (event) => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing request body" }),
      }
    }

    const data = JSON.parse(event.body)
    const created = await createEnergy(data)

    return {
      statusCode: 201,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(created),
    }
  } catch (err) {
    console.error("createEnergy error:", err)

    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error" }),
    }
  }
}

// 🔹 DELETE /energy/{id}
export const deleteEnergyRecord: APIGatewayProxyHandler = async (event) => {
  try {
    const id = event.pathParameters?.id

    if (!id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing id parameter" }),
      }
    }

    await deleteEnergy(id)

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ success: true }),
    }
  } catch (err) {
    console.error("deleteEnergy error:", err)

    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error" }),
    }
  }
}