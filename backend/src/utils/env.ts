import "dotenv/config";

export const REGION = process.env.AWS_REGION || "ap-south-1";

export const TABLES = {
  EMISSIONS: "EmissionsTable",
  GOALS: "GoalsTable",
};

export const CORS = {
  ORIGIN: process.env.CORS_ORIGIN || "*",
};
