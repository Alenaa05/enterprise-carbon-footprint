"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { mockOrganization, mockAIInsights } from "@/lib/mock-data";
import { useState } from "react";

export default function DashboardPage() {
  const org = mockOrganization;

  const REPORT_API = "http://localhost:4000/dev/reports";

  const [showReportForm, setShowReportForm] = useState(false);

  const [reportTitle, setReportTitle] = useState(
    "Sustainability Dashboard Report",
  );

  /* ---------------- CHART DATA ---------------- */

  const carbonData = [
    { name: "Energy", value: 245000 },
    { name: "Transportation", value: 128000 },
    { name: "Supply Chain", value: 892000 },
    { name: "Waste", value: 45000 },
  ];

  const trendData = [
    { month: "Aug", emissions: 1420, renewable: 55 },
    { month: "Sep", emissions: 1380, renewable: 58 },
    { month: "Oct", emissions: 1350, renewable: 62 },
    { month: "Nov", emissions: 1320, renewable: 65 },
    { month: "Dec", emissions: 1310, renewable: 68 },
  ];

  const colors = ["#10b981", "#059669", "#047857", "#065f46"];

  const recentInsights = mockAIInsights.slice(0, 3);

  /* ---------------- GENERATE REPORT ---------------- */
  async function generateReport() {
    const reportData = {
      title: reportTitle,
      emissions: 1310000,
      renewableEnergy: 68,
      waterUsage: 400000,
      wasteRecycled: 63,
    };

    const res = await fetch(`${REPORT_API}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reportData),
    });

    const data = await res.json();

    setShowReportForm(false);

    window.open(`${REPORT_API}/${data.id}/download`);
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{org.name}</h1>

          <p className="text-gray-600 mt-1">
            {org.industry} • {org.employees.toLocaleString()} employees
          </p>
        </div>

        <Button
          className="bg-green-600 hover:bg-green-700"
          onClick={() => setShowReportForm(true)}
        >
          Generate Report
        </Button>
      </div>

      {/* KPI CARDS */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Carbon Emissions
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="text-3xl font-bold">1.31M</div>

            <p className="text-xs text-green-600 flex items-center gap-1 mt-2">
              <TrendingUp className="h-4 w-4" />
              8% improvement from Q3
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Renewable Energy
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="text-3xl font-bold">68%</div>

            <p className="text-xs text-gray-500 mt-2">Target: 100% by 2028</p>

            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{ width: "68%" }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Water Usage
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="text-3xl font-bold">400K L</div>

            <p className="text-xs text-gray-500 mt-2">↓5% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Waste Recycled
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="text-3xl font-bold">63%</div>

            <p className="text-xs text-gray-500 mt-2">4,450 kg total waste</p>
          </CardContent>
        </Card>
      </div>

      {/* CHARTS */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Carbon by Source</CardTitle>
          </CardHeader>

          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={carbonData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  dataKey="value"
                >
                  {carbonData.map((entry, index) => (
                    <Cell key={index} fill={colors[index]} />
                  ))}
                </Pie>

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Sustainability Trends</CardTitle>
          </CardHeader>

          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="month" />

                <YAxis yAxisId="left" />

                <YAxis yAxisId="right" orientation="right" />

                <Tooltip />

                <Legend />

                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="emissions"
                  stroke="#10b981"
                />

                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="renewable"
                  stroke="#059669"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* AI INSIGHTS */}

      <Card>
        <CardHeader>
          <CardTitle>AI-Powered Insights</CardTitle>
          <CardDescription>
            Actionable recommendations from ML analysis
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {recentInsights.map((insight) => (
              <div key={insight.id} className="p-4 border rounded-lg">
                <div className="flex gap-3">
                  {insight.resolved ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}

                  <div>
                    <p className="font-medium">{insight.title}</p>

                    <p className="text-sm text-gray-600">
                      {insight.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* REPORT FORM MODAL */}

      {showReportForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-[420px]">
            <h2 className="text-lg font-semibold mb-4">
              Generate Sustainability Report
            </h2>

            <input
              className="border p-2 w-full mb-4"
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              placeholder="Report Title"
            />

            <div className="flex justify-end gap-2">
              <button
                className="border px-4 py-2"
                onClick={() => setShowReportForm(false)}
              >
                Cancel
              </button>

              <button
                className="bg-green-600 text-white px-4 py-2"
                onClick={generateReport}
              >
                Generate & Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
