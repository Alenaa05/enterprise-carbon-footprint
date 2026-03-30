/**
 * cognito.ts
 *
 * Single source of truth for Cognito config.
 * Values come from .env.local — never hardcoded.
 *
 * Add to frontend/.env.local:
 *   NEXT_PUBLIC_COGNITO_USER_POOL_ID=ap-south-1_BoZTplkeB
 *   NEXT_PUBLIC_COGNITO_CLIENT_ID=shrrsv0l5e490fdi3atps987t
 *   NEXT_PUBLIC_COGNITO_REGION=ap-south-1
 */

export const cognitoConfig = {
  region: process.env.NEXT_PUBLIC_COGNITO_REGION || "ap-south-1",
  userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
  clientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
};

// Named export that auth.ts expects
export const COGNITO = cognitoConfig;
