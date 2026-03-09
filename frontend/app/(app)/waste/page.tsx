"use client";

import AddWasteModal from "@/components/add-waste-modal";
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
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Plus, Download } from "lucide-react";
import api, { WasteRecord } from "@/lib/api";

export default function WastePage() {
  const [records, setRecords] = useState<WasteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);

  const [typeFilter, setTypeFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  async function loadWaste() {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getWaste();
      setRecords(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load waste data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWaste();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this record?")) return;
    await api.deleteWaste(id);
    loadWaste();
  }

  const filteredRecords = records.filter((r) => {
    if (typeFilter !== "all" && r.type !== typeFilter) return false;
    if (fromDate && r.date < fromDate) return false;
    if (toDate && r.date > toDate) return false;
    return true;
  });

  // KPI CALCULATIONS
  const totalWaste = filteredRecords.reduce(
    (sum, r) => sum + (r.amount || 0),
    0,
  );

  const recycledWaste = filteredRecords
    .filter((r) => r.type?.toLowerCase() === "recycled")
    .reduce((sum, r) => sum + (r.amount || 0), 0);

  const recycleRate =
    totalWaste > 0 ? Math.round((recycledWaste / totalWaste) * 100) : 0;

  // PIE DATA (Waste by Type)
  const typeMap: Record<string, number> = {};
  filteredRecords.forEach((r) => {
    if (!r.type) return;
    typeMap[r.type] = (typeMap[r.type] || 0) + (r.amount || 0);
  });

  const wasteTypeData = Object.entries(typeMap).map(([type, value]) => ({
    type,
    value,
  }));

  const colors = ["#059669", "#d1d5db", "#92400e", "#6ee7b7"];

  // DISPOSAL METHOD DATA
  const methodMap: Record<string, number> = {};
  filteredRecords.forEach((r) => {
    if (!r.disposalMethod) return;
    methodMap[r.disposalMethod] =
      (methodMap[r.disposalMethod] || 0) + (r.amount || 0);
  });

  const disposalData = Object.entries(methodMap).map(([method, kg]) => ({
    method,
    kg,
  }));

  function exportCSV() {
    if (!filteredRecords.length) return;

    const headers = ["Date", "Type", "Facility", "Method", "Weight"];
    const rows = filteredRecords.map((r) => [
      r.date,
      r.type,
      r.facility,
      r.disposalMethod,
      r.amount,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "waste-records.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Waste Management</h1>
          <p className="text-gray-600">
            Track waste generation and recycling initiatives
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            className="border rounded px-2 py-1 text-sm"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="Recycled">Recycled</option>
            <option value="General">General</option>
            <option value="Organic">Organic</option>
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
            <Plus className="h-4 w-4" /> Log Waste
          </Button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Total Waste</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {totalWaste.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-2">kg total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">
              Recycle Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{recycleRate}%</div>
            <p className="text-xs text-green-600 mt-2">
              of total waste recycled
            </p>
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
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PIE */}
        <Card>
          <CardHeader>
            <CardTitle>Waste by Type</CardTitle>
          </CardHeader>
          <CardContent>
            {wasteTypeData.length === 0 ? (
              <p className="text-sm text-gray-500">No waste data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={wasteTypeData}
                    dataKey="value"
                    nameKey="type"
                    outerRadius={100}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {wasteTypeData.map((_, i) => (
                      <Cell key={i} fill={colors[i % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* BAR */}
        <Card>
          <CardHeader>
            <CardTitle>Disposal Methods</CardTitle>
          </CardHeader>
          <CardContent>
            {disposalData.length === 0 ? (
              <p className="text-sm text-gray-500">No disposal data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={disposalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="method" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="kg" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* TABLE */}
      <Card>
        <CardHeader>
          <CardTitle>Waste Log</CardTitle>
          <CardDescription>Recent waste entries</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-left py-3 px-4">Type</th>
                  <th className="text-left py-3 px-4">Facility</th>
                  <th className="text-left py-3 px-4">Method</th>
                  <th className="text-right py-3 px-4">Weight</th>
                  <th className="text-right py-3 px-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={6} className="text-center py-4">
                      Loading...
                    </td>
                  </tr>
                )}

                {!loading && filteredRecords.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-gray-500">
                      No waste records yet
                    </td>
                  </tr>
                )}

                {filteredRecords.map((r) => (
                  <tr key={r.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      {new Date(r.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">{r.type}</td>
                    <td className="py-3 px-4">{r.facility}</td>
                    <td className="py-3 px-4">{r.disposalMethod}</td>
                    <td className="py-3 px-4 text-right font-medium">
                      {r.amount?.toLocaleString()}
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

      <AddWasteModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onCreated={loadWaste}
      />
    </div>
  );
}
