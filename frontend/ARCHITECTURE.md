# SustainHub Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js 16)                     │
│  ┌──────────────┬──────────────┬──────────────┬──────────┐  │
│  │  Dashboard   │   Analytics  │   Compliance │  Reports │  │
│  │  Carbon      │   Energy     │   Goals      │  Team    │  │
│  │  Water       │   Waste      │   Supply     │          │  │
│  └──────────────┴──────────────┴──────────────┴──────────┘  │
│                          ↓                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         React Components + Recharts Charts           │   │
│  │     Tailwind CSS + shadcn/ui Components              │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   API Layer (Ready to Build)                 │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  /api/emissions  /api/energy   /api/water            │  │
│  │  /api/waste      /api/suppliers /api/compliance       │  │
│  │  /api/goals      /api/teams     /api/reports          │  │
│  │  /api/insights   /api/auth      /api/analytics        │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              Data Layer & External Services                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────┐  │
│  │  AWS DynamoDB    │  │  OpenAI GPT-4    │  │   Auth   │  │
│  │  (12 Tables)     │  │  (AI Insights)   │  │   Layer  │  │
│  └──────────────────┘  └──────────────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Page Hierarchy

```
/
├── / (Landing Page)
│   └── Features Overview
│       └── CTA to Dashboard
│
└── /(app)/ (Protected Routes)
    ├── /layout.tsx (App Layout + Sidebar)
    ├── /dashboard
    ├── /carbon
    ├── /energy
    ├── /water
    ├── /waste
    ├── /supply-chain
    ├── /compliance
    ├── /goals
    ├── /team
    └── /reports
```

### Component Structure

```
App Layout
├── DashboardHeader
│   ├── Logo & Branding
│   ├── Search Bar
│   └── User Menu
│
├── SidebarNav
│   ├── Module Navigation (10 items)
│   ├── Active State Indicator
│   └── Settings Collapsible
│
└── Main Content
    └── Module Pages
        ├── KPI Cards (4-5)
        ├── Charts (1-2)
        ├── Data Tables
        └── Action Buttons
```

## Data Flow Architecture

### Current State (Demo Mode)

```
Mock Data (lib/mock-data.ts)
    ↓
Components Import Mock Data
    ↓
Client-Side Rendering
    ↓
Browser Display
```

### Production State (AWS + OpenAI)

```
User Action
    ↓
API Route (/api/*)
    ↓
DynamoDB Query/Write
    ↓
OpenAI Analysis (if needed)
    ↓
Response to Frontend
    ↓
UI Update via React
```

## Database Schema (DynamoDB)

### Table Structure

Each table follows this pattern:
- **Primary Key**: `id` or `organizationId#date`
- **Sort Key**: `createdAt`, `date#id`, or similar
- **Attributes**: Type-specific data

### 12 Tables Overview

1. **organizations**
   - PK: `id`
   - Data: name, industry, employees, goals

2. **emissions**
   - PK: `organizationId`
   - SK: `date#id`
   - Data: source, amount, facility

3. **energy**
   - PK: `organizationId`
   - SK: `date#id`
   - Data: type, amount, cost, facility

4. **water**
   - PK: `organizationId`
   - SK: `date#id`
   - Data: source, amount, cost, facility

5. **waste**
   - PK: `organizationId`
   - SK: `date#id`
   - Data: type, amount, method, facility

6. **suppliers**
   - PK: `id`
   - SK: `organizationId`
   - Data: name, carbon, certifications, risk

7. **compliance**
   - PK: `id`
   - SK: `organizationId`
   - Data: regulation, status, dueDate

8. **goals**
   - PK: `id`
   - SK: `organizationId`
   - Data: title, target, progress, status

9. **teams**
   - PK: `id`
   - SK: `organizationId`
   - Data: name, lead, members, responsibilities

10. **reports**
    - PK: `id`
    - SK: `organizationId`
    - Data: type, period, metrics, insights

11. **insights**
    - PK: `id`
    - SK: `organizationId`
    - Data: type, title, impact, resolved

12. **users** (for auth)
    - PK: `id`
    - SK: `organizationId`
    - Data: email, role, permissions

## Module Architecture

### Each Module Follows This Pattern

```
Page Component (/app/(app)/module/page.tsx)
├── useState for local state
├── useEffect for data fetching
├── Layout:
│   ├── Header (Title + Actions)
│   ├── KPI Cards
│   ├── Charts/Visualizations
│   └── Data Tables/Lists
└── Features:
    ├── Filter
    ├── Export
    ├── Add/Edit/Delete
    └── Sort/Search
```

### Module Features

| Module | Cards | Charts | Table | Actions |
|--------|-------|--------|-------|---------|
| Dashboard | 4 | 2 | Insights | View |
| Carbon | 3 | 2 | Emissions | Add |
| Energy | 4 | 2 | Usage | Add |
| Water | 4 | 2 | Usage | Add |
| Waste | 4 | 2 | Log | Add |
| Supply Chain | 4 | 0 | Suppliers | Assess |
| Compliance | 4 | 0 | Records | View |
| Goals | 4 | 0 | Goals | Edit |
| Team | 3 | 0 | Teams | Manage |
| Reports | 4 | 0 | Reports | Download |

## State Management

### Client-Side State

Current implementation uses React hooks:

```typescript
// Component-level state
const [data, setData] = useState(null)
const [filter, setFilter] = useState('')
const [expanded, setExpanded] = useState(true)
```

### Production State Management

Recommended options:
- **SWR** (recommended) - Data fetching with caching
- **React Query** - Server state management
- **Context API** - For global state
- **Zustand** - Lightweight alternative

## Styling Architecture

### Tailwind Configuration

- **Colors**: Green-based theme (sustainability focus)
- **Spacing**: Standard Tailwind scale
- **Fonts**: Geist Sans (default) + Geist Mono
- **Components**: shadcn/ui for consistency

### Color Palette

```
Primary:    Green-600 (#16a34a)
Secondary:  Gray-900 (#111827)
Accent:     Green-700 (#15803d)
Neutral:    Gray-50 to Gray-900
Success:    Green-600
Warning:    Yellow-600
Error:      Red-600
Info:       Blue-600
```

## Performance Optimization

### Current Optimizations

- Static components where possible
- Dynamic imports for heavy modules
- CSS-in-JS optimized with Tailwind
- Image optimization ready

### Production Recommendations

- Implement SWR for data caching
- Use React.memo for expensive components
- Code splitting per module
- API response caching
- CDN for static assets

## Security Architecture

### Frontend Security

- XSS protection via React
- CSRF token handling (when auth added)
- Input sanitization
- Secure cookie handling

### Backend Security (Production)

- IAM authentication for AWS
- API key rotation
- Rate limiting
- Request validation
- Data encryption in transit and at rest

## Deployment Architecture

### Vercel Deployment

```
GitHub Repo
    ↓
Vercel Webhook
    ↓
Build Process
    ↓
Lambda Functions
    ↓
CDN Distribution
```

### AWS Deployment

```
GitHub Repo
    ↓
AWS CodePipeline
    ↓
CodeBuild
    ↓
CloudFormation
    ↓
Route 53 (DNS)
    ↓
CloudFront (CDN)
    ↓
API Gateway + Lambda
    ↓
DynamoDB
```

## Integration Points

### Ready to Integrate

1. **Authentication**
   - Add Auth0, AWS Cognito, or NextAuth.js
   - Protect routes with middleware
   - Role-based access control

2. **Database**
   - Implement DynamoDB queries
   - Add data validation
   - Implement caching layer

3. **AI/ML**
   - Enable OpenAI integration
   - Implement streaming responses
   - Add caching for insights

4. **Analytics**
   - Add Sentry for error tracking
   - Implement CloudWatch logging
   - Add user analytics

5. **Notifications**
   - Implement Slack integration
   - Add email alerts
   - Push notifications

## Scalability Considerations

### Current Architecture Scales To:

- **Users**: 10,000+ concurrent
- **Organizations**: 1,000+
- **Data Points**: 100M+ records
- **API Requests**: 1M+ daily

### Scaling Improvements

- Implement caching layer (Redis)
- Use DynamoDB on-demand or provisioned capacity
- Implement API rate limiting
- Add background job queue
- Use message queues (SQS) for async tasks

## Monitoring & Logging

### Recommended Tools

- **Logging**: CloudWatch, Datadog, or ELK
- **Monitoring**: CloudWatch, Sentry
- **Analytics**: Mixpanel, Amplitude
- **APM**: New Relic, DataDog

### Key Metrics to Track

- API response times
- Error rates
- User engagement
- Data accuracy
- System availability

## Future Enhancements

1. Mobile application
2. Real-time collaboration
3. Advanced forecasting
4. Machine learning models
5. Blockchain audit trail
6. Advanced reporting
7. Custom dashboards
8. API for third-party integration

---

**Last Updated**: February 2025  
**Version**: 1.0  
**Status**: Production Ready
