import { CORS } from "../utils/env";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": CORS.ORIGIN,
  "Access-Control-Allow-Credentials": "true",
  "Content-Type": "application/json",
};

export const handler = async () => {
  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify({ message: "SustainHub backend running 🚀" }),
  };
};
