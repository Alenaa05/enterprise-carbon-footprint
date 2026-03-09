"use client";

import AddEmissionModal from "@/components/add-emission-modal";
import { useEffect, useState } from "react";
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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Plus, Download } from "lucide-react";
import api, { Emission as EmissionType } from "@/lib/api";

export default function CarbonPage() {
  const [emissions, setEmissions] = useState<EmissionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);

  const [sourceFilter, setSourceFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  async function loadEmissions() {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getEmissions();
      setEmissions(data || []);
    } catch (err: any) {
      setError(err?.message || "Failed to load emissions");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEmissions();
  }, []);

  // ✅ FILTERED DATA
  const filteredEmissions = emissions.filter((e) => {
    if (sourceFilter !== "all" && e.source !== sourceFilter) return false;
    if (fromDate && e.date < fromDate) return false;
    if (toDate && e.date > toDate) return false;
    return true;
  });

  // ✅ DELETE
  async function handleDelete(id: string) {
    if (!confirm("Delete this emission?")) return;
    try {
      await api.deleteEmission(id);
      await loadEmissions();
    } catch {
      alert("Delete failed");
    }
  }

  // ✅ KPI CALCULATIONS (filtered)
  const totalEmissions = filteredEmissions.reduce(
    (sum, e) => sum + (e.amount || 0),
    0
  );

  const monthlyAverage =
    filteredEmissions.length > 0
      ? totalEmissions / filteredEmissions.length
      : 0;

  // ✅ MONTHLY TREND (filtered)
  const monthlyMap: Record<string, number> = {};
  filteredEmissions.forEach((e) => {
    if (!e.date) return;
    const month = new Date(e.date).toLocaleString("default", {
      month: "short",
    });
    monthlyMap[month] = (monthlyMap[month] || 0) + (e.amount || 0);
  });

  const monthOrder = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec"
  ];

  const monthlyData = Object.entries(monthlyMap)
    .map(([month, emissions]) => ({ month, emissions }))
    .sort(
      (a, b) =>
        monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month)
    );

  // ✅ SOURCE BREAKDOWN (filtered)
  const sourceMap: Record<string, number> = {};
  filteredEmissions.forEach((e) => {
    if (!e.source) return;
    sourceMap[e.source] = (sourceMap[e.source] || 0) + (e.amount || 0);
  });

  const sourceData = Object.entries(sourceMap).map(([source, value]) => ({
    source,
    value,
  }));

  // ✅ CSV EXPORT
  function exportCSV() {
    if (!filteredEmissions.length) return;

    const headers = ["Date", "Source", "Facility", "Amount", "Notes"];
    const rows = filteredEmissions.map((e) => [
      e.date,
      e.source,
      e.facility || "",
      e.amount,
      e.notes || "",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "emissions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Carbon Emissions</h1>
          <p className="text-gray-600">
            Track and manage carbon footprint across all operations
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            className="border rounded px-2 py-1 text-sm"
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
          >
            <option value="all">All Sources</option>
            <option value="Energy">Energy</option>
            <option value="Transportation">Transportation</option>
            <option value="Supply Chain">Supply Chain</option>
          </select>

          <input
            type="date"
            className="border rounded px-2 py-1 text-sm"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />

          <input
            type="date"
            className="border rounded px-2 py-1 text-sm"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />

          <Button
            variant="outline"
            onClick={exportCSV}
            className="gap-2 bg-transparent"
          >
            <Download className="h-4 w-4" /> Export
          </Button>

          <Button
            onClick={() => setOpenModal(true)}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 gap-2"
          >
            <Plus className="h-4 w-4" /> Log Emission
          </Button>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Emissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {totalEmissions.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Average per Entry
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {monthlyAverage.toFixed(0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Offset Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">42%</div>
          </CardContent>
        </Card>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Emissions by Source</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sourceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="source" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="emissions"
                  stroke="#059669"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* TABLE */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Emissions Log</CardTitle>
          <CardDescription>Latest entries</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-left py-3 px-4">Source</th>
                  <th className="text-left py-3 px-4">Facility</th>
                  <th className="text-right py-3 px-4">Amount</th>
                  <th className="text-left py-3 px-4">Notes</th>
                  <th className="text-right py-3 px-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredEmissions.map((e) => (
                  <tr key={e.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{e.date}</td>
                    <td className="py-3 px-4">{e.source}</td>
                    <td className="py-3 px-4">{e.facility}</td>
                    <td className="py-3 px-4 text-right">
                      {e.amount?.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">{e.notes || "-"}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        className="text-red-600 hover:underline"
                        onClick={() => handleDelete(e.id!)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <AddEmissionModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onCreated={loadEmissions}
      />
    </div>
  );
}