# SustainHub - Quick Start Guide

## Welcome to the Enterprise Sustainability Management Platform

### What is SustainHub?

SustainHub is a comprehensive, AI-powered platform for managing enterprise sustainability initiatives. It provides real-time tracking, analytics, compliance management, and team collaboration tools across 10 core modules.

### Getting Started in 3 Steps

#### Step 1: Install & Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

#### Step 2: Explore the Platform

Visit `http://localhost:3000` to see:

- **Landing Page**: Overview of all features
- Click **"Enter Platform"** or **"Get Started"** button
- You'll be redirected to the dashboard with full demo data

#### Step 3: Navigate the Modules

Use the sidebar navigation to explore all 10 modules:

### 10 Core Modules Overview

#### 1. Dashboard (`/dashboard`)
- Real-time KPIs and metrics
- Carbon emissions breakdown
- Sustainability trends
- AI-powered insights
- Goal progress tracking

**Key Metrics:**
- Total Carbon Emissions: 1.31M kg CO2e
- Renewable Energy: 68% (Target: 100% by 2028)
- Water Usage: 400K liters
- Waste Recycled: 63%

---

#### 2. Carbon Emissions (`/carbon`)
Track all carbon emissions by source

**Features:**
- Emissions by source (Energy, Transportation, Supply Chain, Waste)
- Monthly trend analysis
- Recent emissions log
- Filter and export capabilities

**Demo Data:**
- Energy: 245K kg CO2e
- Transportation: 128K kg CO2e
- Supply Chain: 892K kg CO2e (largest source)
- Waste: 45K kg CO2e

---

#### 3. Energy Management (`/energy`)
Monitor and optimize energy consumption

**Features:**
- Energy type breakdown (Electricity, Renewable, Natural Gas)
- Consumption by facility
- Cost tracking and analysis
- Renewable energy percentage progress

**Demo Data:**
- Total Consumption: 245K kWh
- Renewable: 68%
- Monthly Cost: $31.7K

---

#### 4. Water Tracking (`/water`)
Track water usage and recycling

**Features:**
- Water source monitoring (Municipal, Recycled, Groundwater)
- Monthly trends
- Cost analysis
- Recycling rate tracking

**Demo Data:**
- Total Usage: 400K liters
- Recycled Water: 38%
- Cost per 1000L: $2.62

---

#### 5. Waste Management (`/waste`)
Manage waste streams and recycling

**Features:**
- Waste type tracking (Recycled, General, Organic)
- Disposal method monitoring
- Landfill diversion rate
- Progress toward zero waste goal

**Demo Data:**
- Total Waste: 4.45K kg
- Recycle Rate: 63%
- Landfill Diversion: 73%

---

#### 6. Supply Chain (`/supply-chain`)
Monitor supplier sustainability

**Features:**
- Supplier profiles with carbon footprints
- Sustainability certifications
- Risk scoring (0-100)
- Assessment tracking

**Demo Suppliers:**
- EcoPackaging Inc (Low Risk: 15)
- TechComponents Ltd (Medium Risk: 42)
- Global Logistics Co (High Risk: 68)

---

#### 7. Compliance & Regulations (`/compliance`)
Track regulatory requirements

**Features:**
- Compliance status tracking
- Audit scheduling
- Deadline management
- Certification tracking

**Demo Regulations:**
- ISO 14001 Environmental Management (Compliant)
- Carbon Disclosure Project (Compliant)
- CSRD Reporting (Pending)

---

#### 8. Goals & Targets (`/goals`)
Set and track sustainability goals

**Features:**
- Goal progress visualization
- Status tracking (On-Track, At-Risk, Behind)
- Deadline monitoring
- Recommended actions

**Demo Goals:**
- Carbon Neutral by 2030 (42% - On Track)
- 100% Renewable Energy by 2028 (68% - On Track)
- Zero Waste to Landfill by 2027 (55% - At Risk)

---

#### 9. Team Collaboration (`/team`)
Coordinate sustainability initiatives

**Features:**
- Team management
- Member engagement tracking
- Shared initiatives
- Contribution metrics

**Demo Teams:**
- Sustainability Champions (4 members)
- Energy Optimization (3 members)

---

#### 10. Reports & Analytics (`/reports`)
Generate comprehensive reports

**Features:**
- Report generation and management
- Multiple report types (Quarterly, Annual, Compliance)
- Publish/Draft status
- Download and sharing

**Demo Reports:**
- Q4 2024 Sustainability Report
- Annual Sustainability Report 2024
- Carbon Disclosure Project Response

---

## Key Features Explained

### AI-Powered Insights

The platform includes AI interfaces powered by OpenAI GPT-4:

**Insight Types:**
- **Anomaly Detection**: Identifies unusual patterns in data
- **Recommendations**: Suggests actions to improve sustainability
- **Forecasting**: Predicts future metrics based on trends
- **Analysis**: Provides detailed sustainability analysis

**Example Insights (Demo):**
- Energy spike detected (35% above normal)
- Recommendation to switch renewable energy provider
- Q1 2025 energy projection (75% renewable)
- Water usage optimization opportunities

### Real-Time Analytics

- **Charts & Graphs**: Interactive Recharts visualizations
- **KPI Cards**: Key metrics at a glance
- **Progress Tracking**: Visual progress bars for goals
- **Status Indicators**: Color-coded status (Green/Yellow/Red)

### Data Visualization

The platform includes:
- Line charts for trends
- Pie charts for breakdowns
- Bar charts for comparisons
- Progress bars for goals
- Status badges for quick assessment

## Environment Setup

### For Demo (No Configuration Needed)

The platform works out-of-the-box with mock data.

```bash
npm run dev
# Demo data loads automatically
```

### For Production (AWS + OpenAI)

Create `.env.local`:

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
OPENAI_API_KEY=your_openai_key
```

## Common Tasks

### View All Modules

1. Open `http://localhost:3000/dashboard`
2. Use sidebar to navigate
3. Each module has sample data

### Add New Data

Each module has an "+ Add" button (non-functional in demo):
- Carbon: "+ Log Emission"
- Energy: "+ Log Usage"
- Water: "+ Log Usage"
- Waste: "+ Log Waste"
- Supply Chain: "+ Add Supplier"
- Compliance: "+ Add Regulation"
- Goals: "+ New Goal"
- Team: "+ Create Team"
- Reports: "+ Generate Report"

### Export Data

Click "Export" button in any module to download data (demo only exports mock data).

### Filter Data

Click "Filter" button to filter by:
- Date range
- Facility
- Category
- Status

## Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16, React 19, TypeScript |
| **Styling** | Tailwind CSS, shadcn/ui |
| **Charts** | Recharts |
| **State** | React hooks, Client components |
| **Database** | AWS DynamoDB (configured) |
| **AI** | OpenAI GPT-4 (configured) |
| **Deployment** | AWS/Vercel (ready) |

## File Structure

```
/app
  /page.tsx                 # Landing page
  /layout.tsx              # Root layout
  /(app)
    /layout.tsx            # App layout with sidebar
    /dashboard             # Dashboard module
    /carbon                # Carbon tracking module
    /energy                # Energy management module
    /water                 # Water tracking module
    /waste                 # Waste management module
    /supply-chain          # Supply chain module
    /compliance            # Compliance module
    /goals                 # Goals & targets module
    /team                  # Team collaboration module
    /reports               # Reports module

/components
  /dashboard-header.tsx    # Top navigation
  /sidebar-nav.tsx         # Sidebar navigation
  /ui/                     # shadcn/ui components

/lib
  /db-models.ts           # TypeScript interfaces
  /mock-data.ts           # Demo data
  /ai-service.ts          # OpenAI integration
  /aws-config.ts          # AWS configuration
  /utils.ts               # Utilities
```

## Next Steps

### 1. Deploy to Production

```bash
# Build for production
npm run build

# Deploy to Vercel
vercel

# Or deploy to AWS
# Configure AWS credentials and deploy
```

### 2. Set Up AWS DynamoDB

- Create DynamoDB tables (see DEPLOYMENT.md)
- Configure IAM roles
- Enable encryption

### 3. Implement Backend APIs

- Create API routes in `/app/api/`
- Connect to DynamoDB
- Implement data persistence

### 4. Add Authentication

- Integrate Auth0, AWS Cognito, or similar
- Add login/logout functionality
- Implement role-based access control

### 5. Connect to Real Data

- Replace mock data with actual API calls
- Configure DynamoDB queries
- Set up data refresh schedules

## Troubleshooting

### Port Already in Use
```bash
# Use different port
npm run dev -- -p 3001
```

### Module Not Loading
1. Check sidebar navigation
2. Verify route exists in `/app/(app)/`
3. Clear browser cache

### Mock Data Not Showing
1. The mock data loads automatically
2. Check browser console for errors
3. Ensure you're on `/dashboard`

## Support & Documentation

- **Deployment**: See `DEPLOYMENT.md`
- **Architecture**: See code comments in modules
- **Configuration**: See `lib/aws-config.ts`
- **Data Models**: See `lib/db-models.ts`

## Demo Credentials

The demo uses mock data, no login required.

**Demo Organization:**
- Name: GreenTech Industries
- Industry: Technology
- Employees: 5,000
- HQ: San Francisco, CA

---

**Ready to explore?** Start the dev server and visit `http://localhost:3000`!

**Questions?** Check DEPLOYMENT.md for detailed setup instructions.
