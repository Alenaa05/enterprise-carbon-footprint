# 🌱 SustainHub  
### Enterprise Sustainability Management Platform

SustainHub is a full-stack web application designed to help organizations track, manage, and improve sustainability metrics across operations.

It integrates:
- 🌿 Emissions tracking  
- ⚡ Energy usage  
- 📜 Compliance  
- 📊 Reporting  
- 📦 Supply chain insights  

All in a **single unified dashboard**.

---

## 🚀 Features

### 📊 Dashboard
- Overview of sustainability metrics  
- Alerts & recommendations  
- Real-time data insights  

### 🌿 Carbon Emissions
- Track emissions by source  
- Add, view, and delete records  
- Historical data tracking  

### ⚡ Energy Management
- Monitor energy consumption  
- Renewable vs non-renewable tracking  

### 💧 Water Tracking
- Track water usage across facilities  
- Analyze consumption trends  

### ♻️ Waste Management
- Record waste generation  
- Track recycling performance  

### 🏭 Supply Chain
- Manage suppliers  
- Track sustainability metrics & certifications  

### 📜 Compliance & Regulations
- Add and manage regulatory requirements  
- Track audit status and due dates  

### 🎯 Goals & Targets
- Set sustainability goals  
- Track progress and performance  

### 👥 Team Collaboration
- Create teams  
- Assign projects and responsibilities  

### 📄 Reports
- Generate sustainability reports  
- Export/download reports (PDF supported)  

### 🚨 Alerts & Recommendations
- Detect anomalies  
- AI-driven sustainability suggestions  

---

## 🏗️ Tech Stack

| Layer          | Technology |
|----------------|-----------|
| **Frontend**   | Next.js, TypeScript, Tailwind CSS |
| **Backend**    | Node.js (Serverless Framework), AWS Lambda, API Gateway |
| **Database**   | AWS DynamoDB |
| **Auth**       | AWS Cognito (JWT-based authentication) |

---

## ⚙️ Project Structure

```bash
/frontend        # Next.js application
/backend         # Serverless backend (Lambda functions)
  /services      # Business logic (DynamoDB operations)
  /handlers      # API handlers
  /utils         # Shared utilities (env, auth, etc.)
