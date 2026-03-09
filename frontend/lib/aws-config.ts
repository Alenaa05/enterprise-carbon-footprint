// AWS Configuration for DynamoDB and other services
// This file provides centralized configuration for AWS services

export const awsConfig = {
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
}

// DynamoDB Table Names
export const dynamoDBTables = {
  organizations: process.env.DYNAMODB_TABLE_ORGANIZATIONS || 'organizations',
  emissions: process.env.DYNAMODB_TABLE_EMISSIONS || 'emissions',
  energy: process.env.DYNAMODB_TABLE_ENERGY || 'energy',
  water: process.env.DYNAMODB_TABLE_WATER || 'water',
  waste: process.env.DYNAMODB_TABLE_WASTE || 'waste',
  suppliers: process.env.DYNAMODB_TABLE_SUPPLIERS || 'suppliers',
  compliance: process.env.DYNAMODB_TABLE_COMPLIANCE || 'compliance',
  goals: process.env.DYNAMODB_TABLE_GOALS || 'goals',
  teams: process.env.DYNAMODB_TABLE_TEAMS || 'teams',
  reports: process.env.DYNAMODB_TABLE_REPORTS || 'reports',
  insights: process.env.DYNAMODB_TABLE_INSIGHTS || 'insights',
}

// DynamoDB Client Configuration (when needed for server-side operations)
export function getDynamoDBClientConfig() {
  return {
    region: awsConfig.region,
    credentials: {
      accessKeyId: awsConfig.accessKeyId || '',
      secretAccessKey: awsConfig.secretAccessKey || '',
    },
  }
}

// OpenAI Configuration
export const openaiConfig = {
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4',
  temperature: 0.7,
  maxTokens: 1000,
}

// Validation function to check if all required env vars are set
export function validateEnvironmentVariables(): {
  valid: boolean
  missing: string[]
} {
  const required = ['AWS_REGION', 'OPENAI_API_KEY']
  const missing: string[] = []

  required.forEach((key) => {
    if (!process.env[key]) {
      missing.push(key)
    }
  })

  return {
    valid: missing.length === 0,
    missing,
  }
}

// Example DynamoDB Query Helpers (to be implemented with actual SDK)
export const dynamoDBHelpers = {
  // Get organization by ID
  getOrganization: async (organizationId: string) => {
    // Implementation with @aws-sdk/client-dynamodb
    console.log(`[TODO] Fetching organization: ${organizationId}`)
    return null
  },

  // Query emissions for organization
  queryEmissions: async (organizationId: string, startDate: string, endDate: string) => {
    // Implementation with @aws-sdk/client-dynamodb
    console.log(`[TODO] Querying emissions for ${organizationId}`)
    return []
  },

  // Put new emission record
  putEmission: async (emission: Record<string, unknown>) => {
    // Implementation with @aws-sdk/client-dynamodb
    console.log(`[TODO] Putting emission record: `, emission)
    return null
  },

  // Query goals for organization
  queryGoals: async (organizationId: string) => {
    // Implementation with @aws-sdk/client-dynamodb
    console.log(`[TODO] Querying goals for ${organizationId}`)
    return []
  },

  // Update goal progress
  updateGoalProgress: async (goalId: string, progress: number) => {
    // Implementation with @aws-sdk/client-dynamodb
    console.log(`[TODO] Updating goal ${goalId} progress to ${progress}`)
    return null
  },
}

// Export configuration object for easy access
export default {
  aws: awsConfig,
  dynamoDB: dynamoDBTables,
  openai: openaiConfig,
  helpers: dynamoDBHelpers,
}
