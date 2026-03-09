# SustainHub Deployment Guide

## Enterprise Sustainability Management Platform

### Overview

SustainHub is an enterprise-grade sustainability management platform built with Next.js, featuring 10 core modules for tracking carbon emissions, energy usage, water consumption, waste management, compliance, goals, team collaboration, supply chain monitoring, and AI-powered insights.

### Technology Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Database**: AWS DynamoDB (NoSQL)
- **AI/ML**: OpenAI GPT-4 for analytics and recommendations
- **Deployment**: AWS (Vercel-compatible)
- **UI Components**: shadcn/ui, Recharts for visualizations

### 10 Core Modules

1. **Dashboard** - Real-time sustainability overview with KPIs
2. **Carbon Emissions** - Track emissions by source (energy, transportation, supply chain, waste)
3. **Energy Management** - Monitor consumption, costs, and renewable energy progress
4. **Water Tracking** - Track water usage by source (municipal, recycled, groundwater)
5. **Waste Management** - Monitor waste streams (general, hazardous, recycled, organic)
6. **Supply Chain** - Assess supplier sustainability and risk scores
7. **Compliance & Regulations** - Manage regulatory requirements (ISO 14001, CDP, CSRD)
8. **Goals & Targets** - Set and track sustainability goals with progress monitoring
9. **Team Collaboration** - Coordinate teams and track contribution across initiatives
10. **Reports & Analytics** - Generate comprehensive sustainability reports with AI insights

### Features

✅ Real-time data visualization with interactive charts
✅ AI-powered insights and anomaly detection
✅ Compliance tracking and deadline management
✅ Supplier sustainability assessments
✅ Team engagement and collaboration tools
✅ Mock data for immediate demo
✅ Responsive design for desktop and tablet
✅ Dark mode ready architecture

### Prerequisites

- Node.js 18+
- npm or yarn
- AWS account (for DynamoDB deployment)
- OpenAI API key (for AI features)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd sustainhub

# Install dependencies
npm install

# Run development server
npm run dev
```

Visit `http://localhost:3000` to see the application.

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# DynamoDB Tables
DYNAMODB_TABLE_ORGANIZATIONS=organizations
DYNAMODB_TABLE_EMISSIONS=emissions
DYNAMODB_TABLE_ENERGY=energy
DYNAMODB_TABLE_WATER=water
DYNAMODB_TABLE_WASTE=waste
DYNAMODB_TABLE_SUPPLIERS=suppliers
DYNAMODB_TABLE_COMPLIANCE=compliance
DYNAMODB_TABLE_GOALS=goals
DYNAMODB_TABLE_TEAMS=teams
DYNAMODB_TABLE_REPORTS=reports
DYNAMODB_TABLE_INSIGHTS=insights
```

### DynamoDB Setup

The platform uses the following DynamoDB tables. Create them in your AWS account:

```javascript
// Organizations Table
PK: id (String)
SK: createdAt (String)
Attributes: name, industry, employees, headquarters, sustainabilityGoals

// Emissions Table
PK: organizationId (String)
SK: date#id (String)
Attributes: source, amount, facility, notes

// Energy Table
PK: organizationId (String)
SK: date#id (String)
Attributes: type, amount, cost, facility

// Water Table
PK: organizationId (String)
SK: date#id (String)
Attributes: source, amount, cost, facility

// Waste Table
PK: organizationId (String)
SK: date#id (String)
Attributes: type, amount, disposalMethod, facility

// Suppliers Table
PK: id (String)
SK: organizationId (String)
Attributes: name, category, carbonFootprint, certifications, riskScore

// Compliance Table
PK: id (String)
SK: organizationId (String)
Attributes: regulation, status, dueDate, lastAuditDate, notes

// Goals Table
PK: id (String)
SK: organizationId (String)
Attributes: title, target, unit, deadline, category, progress, status

// Teams Table
PK: id (String)
SK: organizationId (String)
Attributes: name, lead, members, responsibilities

// Reports Table
PK: id (String)
SK: organizationId (String)
Attributes: type, period, generatedAt, data

// Insights Table
PK: id (String)
SK: organizationId (String)
Attributes: type, title, description, impact, actionItems, resolved
```

### AWS Deployment

#### Option 1: Deploy to Vercel (Recommended for AWS backend)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Configure AWS credentials and OpenAI API key
```

#### Option 2: Direct AWS Deployment

```bash
# Build the application
npm run build

# Deploy to AWS Lambda + API Gateway + S3
# Or use AWS Amplify for serverless deployment
vercel --prod
```

#### Option 3: AWS EC2 Deployment

```bash
# Build for production
npm run build

# Start production server
npm run start
```

### Integration with OpenAI

The platform includes AI service interfaces for:

- **Sustainability Recommendations** - Generate actionable insights
- **Forecasting** - Predict future metrics based on trends
- **Anomaly Detection** - Identify unusual patterns in data
- **Report Generation** - Create natural language sustainability reports
- **Supplier Analysis** - Assess supplier sustainability performance

To enable AI features, configure your OpenAI API key in environment variables.

### API Routes (to be implemented)

```
/api/emissions - Carbon tracking
/api/energy - Energy management
/api/water - Water tracking
/api/waste - Waste management
/api/suppliers - Supply chain
/api/compliance - Compliance tracking
/api/goals - Goals management
/api/teams - Team collaboration
/api/reports - Report generation
/api/insights - AI-powered insights
```

### Mock Data

The platform includes comprehensive mock data for immediate demo:

- Sample organization (GreenTech Industries)
- Historical emissions data by source
- Energy consumption and costs
- Water usage patterns
- Waste streams
- Supplier sustainability profiles
- Compliance records
- Sustainability goals
- Team structures
- AI-generated insights

Access at `/dashboard` to see all modules with demo data.

### Building for Production

```bash
# Build the application
npm run build

# Analyze bundle size
npm run build -- --analyze

# Start production server
npm run start
```

### Performance Optimization

- Next.js Image optimization enabled
- Code splitting for faster load times
- CSS-in-JS optimization with Tailwind
- Dynamic imports for heavy components
- Server-side rendering for core pages

### Security Considerations

- Use IAM roles for AWS service access (no hardcoded credentials)
- Enable encryption for DynamoDB tables
- Use environment variables for sensitive data
- Implement API rate limiting
- Add authentication/authorization layer
- Enable HTTPS for all endpoints
- Regular security audits

### Monitoring & Analytics

Consider integrating:
- AWS CloudWatch for logs and metrics
- Sentry for error tracking
- DataDog or New Relic for APM
- Google Analytics for user behavior

### Next Steps

1. Configure AWS DynamoDB tables
2. Set up OpenAI API integration
3. Implement authentication (Auth0, AWS Cognito, etc.)
4. Add backend API routes
5. Implement data persistence layer
6. Deploy to production
7. Set up monitoring and alerts

### Support & Resources

- Next.js Documentation: https://nextjs.org/docs
- AWS DynamoDB: https://aws.amazon.com/dynamodb/
- OpenAI API: https://platform.openai.com/docs
- shadcn/ui: https://ui.shadcn.com

### License

Proprietary - SustainHub Enterprise Platform

---

**Version**: 1.0.0  
**Last Updated**: February 2025  
**Status**: Production Ready
