# Backend integration guide

This file explains how to integrate and deploy the backend to AWS.

Quick steps (local development):

1. Install dependencies

```bash
cd backend
npm install
```

2. Start serverless offline

```bash
npm run dev
```

3. Environment

- `EMISSIONS_TABLE` — DynamoDB table name (default `emissions`)
- `CORS_ORIGIN` — Allowed CORS origin (default `*`)

Deploying to AWS:

1. Configure AWS credentials (CLI)

```bash
aws configure
```

2. Deploy

```bash
npx serverless deploy
```

Notes:

- The service creates a DynamoDB table via CloudFormation (see `serverless.yml`).
- Add Cognito, S3 and other resources manually or extend `serverless.yml` resources as needed.
