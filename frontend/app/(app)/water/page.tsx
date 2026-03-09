"use client";

import AddWaterModal from "@/components/add-water-modal";
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
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Plus, Download } from "lucide-react";
import api, { WaterRecord } from "@/lib/api";

export default function WaterPage() {
  const [records, setRecords] = useState<WaterRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);

  // filters
  const [sourceFilter, setSourceFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  async function loadWater() {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getWater();
      setRecords(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load water data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWater();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this record?")) return;
    await api.deleteWater(id);
    loadWater();
  }

  // ================= FILTER =================
  const filteredRecords = records.filter((r) => {
    if (sourceFilter !== "all" && r.source !== sourceFilter) return false;
    if (fromDate && r.date < fromDate) return false;
    if (toDate && r.date > toDate) return false;
    return true;
  });

  // ================= KPI =================
  const totalUsage = filteredRecords.reduce(
    (sum, r) => sum + (r.consumption || 0),
    0,
  );

  const recycledUsage = filteredRecords
    .filter((r) => r.source?.toLowerCase().includes("recycled"))
    .reduce((sum, r) => sum + (r.consumption || 0), 0);

  const recycledPercent =
    totalUsage > 0 ? Math.round((recycledUsage / totalUsage) * 100) : 0;

  // ================= CHART DATA =================
  const sourceMap: Record<string, number> = {};
  filteredRecords.forEach((r) => {
    if (!r.source) return;
    sourceMap[r.source] = (sourceMap[r.source] || 0) + (r.consumption || 0);
  });

  const waterSourceData = Object.entries(sourceMap).map(([source, value]) => ({
    source,
    value,
  }));

  const monthlyMap: Record<string, number> = {};
  filteredRecords.forEach((r) => {
    if (!r.date) return;
    const month = new Date(r.date).toLocaleString("default", {
      month: "short",
    });
    monthlyMap[month] = (monthlyMap[month] || 0) + (r.consumption || 0);
  });

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

  const monthlyWaterData = Object.entries(monthlyMap)
    .map(([month, usage]) => ({
      month,
      usage,
    }))
    .sort(
      (a, b) =>
        monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month),
    );

  // ================= EXPORT =================
  function exportCSV() {
    if (!filteredRecords.length) return;

    const headers = ["Date", "Source", "Facility", "Consumption"];
    const rows = filteredRecords.map((r) => [
      r.date,
      r.source,
      r.facility || "",
      r.consumption,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "water-records.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Water Tracking</h1>
          <p className="text-gray-600">
            Monitor water consumption and recycling initiatives
          </p>
        </div>

        {/* FILTERS */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            className="border rounded px-2 py-1 text-sm"
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
          >
            <option value="all">All Sources</option>
            <option value="Municipal">Municipal</option>
            <option value="Recycled">Recycled</option>
            <option value="Groundwater">Groundwater</option>
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
            className="gap-2 bg-transparent"
            onClick={exportCSV}
          >
            <Download className="h-4 w-4" /> Export
          </Button>

          <Button
            className="bg-green-600 hover:bg-green-700 gap-2"
            onClick={() => setOpenModal(true)}
          >
            <Plus className="h-4 w-4" /> Log Usage
          </Button>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Total Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {totalUsage.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-2">liters</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">
              Recycled Water
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{recycledPercent}%</div>
            <p className="text-xs text-green-600 mt-2">of total usage</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">
              Records Logged
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{filteredRecords.length}</div>
            <p className="text-xs text-gray-500 mt-2">entries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Avg Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {filteredRecords.length
                ? Math.round(totalUsage / filteredRecords.length)
                : 0}
            </div>
            <p className="text-xs text-gray-500 mt-2">liters per entry</p>
          </CardContent>
        </Card>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Water by Source</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={waterSourceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="source" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#0ea5e9" />
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
              <LineChart data={monthlyWaterData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="usage"
                  stroke="#0ea5e9"
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
          <CardTitle>Water Usage Log</CardTitle>
          <CardDescription>Recent water consumption entries</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-left py-3 px-4">Source</th>
                  <th className="text-left py-3 px-4">Facility</th>
                  <th className="text-right py-3 px-4">Usage (L)</th>
                  <th className="text-right py-3 px-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={5} className="text-center py-4">
                      Loading...
                    </td>
                  </tr>
                )}

                {!loading && filteredRecords.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-gray-500">
                      No water records yet
                    </td>
                  </tr>
                )}

                {filteredRecords.map((r) => (
                  <tr key={r.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      {new Date(r.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">{r.source}</td>
                    <td className="py-3 px-4">{r.facility}</td>
                    <td className="py-3 px-4 text-right font-medium">
                      {r.consumption?.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        className="text-red-600 hover:underline"
                        onClick={() => handleDelete(r.id!)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {error && <p className="text-red-600 mt-3">{error}</p>}
          </div>
        </CardContent>
      </Card>

      <AddWaterModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onCreated={loadWater}
      />
    </div>
  );
}
