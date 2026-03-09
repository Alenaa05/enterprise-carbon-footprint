"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
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
import api, {
  Emission,
  EnergyRecord,
  WaterRecord,
  WasteRecord,
  Goal,
} from "@/lib/api";
import { useEffect, useMemo, useState } from "react";

export default function DashboardPage() {
  const org = mockOrganization;

  const [emissions, setEmissions] = useState<Emission[]>([]);
  const [energy, setEnergy] = useState<EnergyRecord[]>([]);
  const [water, setWater] = useState<WaterRecord[]>([]);
  const [waste, setWaste] = useState<WasteRecord[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const [e, en, w, wa] = await Promise.all([
          api.getEmissions(),
          api.getEnergy(),
          api.getWater(),
          api.getWaste(),
        ]);
        setEmissions(e || []);
        setEnergy(en || []);
        setWater(w || []);
        setWaste(wa || []);
      } catch (err) {
        console.error("Dashboard data load error", err);
      }
    }

    load();
  }, []);

  useEffect(() => {
    async function loadGoals() {
      try {
        const data = await api.getGoals();
        setGoals((data || []).slice(0, 4));
      } catch (err) {
        console.error("Dashboard goals load error", err);
      }
    }
    loadGoals();
  }, []);

  const totalEmissions = useMemo(
    () => emissions.reduce((sum, r) => sum + (r.amount || 0), 0),
    [emissions],
  );

  const totalEnergy = useMemo(
    () => energy.reduce((sum, r) => sum + (r.consumption || 0), 0),
    [energy],
  );

  const totalWater = useMemo(
    () => water.reduce((sum, r) => sum + (r.consumption || 0), 0),
    [water],
  );

  const totalWaste = useMemo(
    () => waste.reduce((sum, r) => sum + (r.amount || 0), 0),
    [waste],
  );

  const renewableEnergyPercent = useMemo(() => {
    if (!energy.length || totalEnergy === 0) return 0;
    const renewable = energy
      .filter((r) => r.source?.toLowerCase().includes("renewable"))
      .reduce((sum, r) => sum + (r.consumption || 0), 0);
    return Math.round((renewable / totalEnergy) * 100);
  }, [energy, totalEnergy]);

  const carbonBySource = useMemo(() => {
    const map: Record<string, number> = {};
    emissions.forEach((e) => {
      if (!e.source) return;
      map[e.source] = (map[e.source] || 0) + (e.amount || 0);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [emissions]);

  const monthOrder = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const trendData = useMemo(() => {
    const emissionByMonth: Record<string, number> = {};
    emissions.forEach((e) => {
      if (!e.date) return;
      const m = new Date(e.date).toLocaleString("default", { month: "short" });
      emissionByMonth[m] = (emissionByMonth[m] || 0) + (e.amount || 0);
    });

    const renewableByMonth: Record<string, number> = {};
    energy.forEach((r) => {
      if (!r.date) return;
      const m = new Date(r.date).toLocaleString("default", { month: "short" });
      const isRenewable = r.source?.toLowerCase().includes("renewable");
      if (!isRenewable) return;
      renewableByMonth[m] = (renewableByMonth[m] || 0) + (r.consumption || 0);
    });

    return monthOrder
      .filter((m) => emissionByMonth[m] || renewableByMonth[m])
      .map((m) => ({
        month: m,
        emissions: (emissionByMonth[m] || 0) / 1000, // thousands kg
        renewable: renewableEnergyPercent,
      }));
  }, [emissions, energy, renewableEnergyPercent]);

  const colors = ["#10b981", "#059669", "#047857", "#065f46"];

  const recentInsights = mockAIInsights.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{org.name}</h1>
          <p className="text-gray-600 mt-1">
            {org.industry} • {org.employees.toLocaleString()} employees
          </p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          Generate Report
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Carbon Emissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {(totalEmissions / 1_000_000).toFixed(2)}M
            </div>
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
            <div className="text-3xl font-bold">{renewableEnergyPercent}%</div>
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
            <div className="text-3xl font-bold">
              {(totalWater / 1000).toFixed(0)}K L
            </div>
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
            <div className="text-3xl font-bold">
              {totalWaste ? Math.round((totalWaste / 1000) * 10) / 10 : 0}K
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {totalWaste.toLocaleString()} kg total waste
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Carbon Emissions by Source */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Carbon by Source</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={carbonBySource}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ value }) => `${(value / 1000).toFixed(0)}K`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {carbonBySource.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `${(value / 1000).toFixed(1)}K kg`}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Trends */}
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
                  name="Emissions (thousands kg)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="renewable"
                  stroke="#059669"
                  name="Renewable %"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Sustainability Goals */}
      <Card>
        <CardHeader>
          <CardTitle>Sustainability Goals Progress</CardTitle>
          <CardDescription>
            Tracking progress toward 2030 targets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {goals.map((goal) => (
              <div key={goal.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{goal.title}</p>
                    <p className="text-sm text-gray-600">
                      Target: {goal.target} {goal.unit}
                    </p>
                  </div>
                  <div
                    className={`text-xs font-semibold px-2 py-1 rounded ${
                      goal.status === "on-track"
                        ? "bg-green-100 text-green-700"
                        : goal.status === "at-risk"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {goal.status === "on-track"
                      ? "On Track"
                      : goal.status === "at-risk"
                        ? "At Risk"
                        : "Behind"}
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                    style={{ width: `${goal.progress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 text-right">
                  {goal.progress}% complete
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle>AI-Powered Insights</CardTitle>
          <CardDescription>
            Actionable recommendations from machine learning analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentInsights.map((insight) => (
              <div
                key={insight.id}
                className={`p-4 border rounded-lg ${
                  insight.impact === "high"
                    ? "border-red-200 bg-red-50"
                    : insight.impact === "medium"
                      ? "border-yellow-200 bg-yellow-50"
                      : "border-blue-200 bg-blue-50"
                }`}
              >
                <div className="flex items-start gap-3">
                  {insight.resolved ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                  ) : insight.impact === "high" ? (
                    <AlertCircle className="h-5 w-5 text-red-600 mt-1 flex-shrink-0" />
                  ) : (
                    <Clock className="h-5 w-5 text-yellow-600 mt-1 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{insight.title}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {insight.description}
                    </p>
                    <div className="flex gap-2 mt-2">
                      {insight.actionItems.map((item, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-white px-2 py-1 rounded"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
