"use client";

import AddEnergyModal from "@/components/add-energy-modal";
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
import api, { EnergyRecord } from "@/lib/api";

export default function EnergyPage() {
  const [records, setRecords] = useState<EnergyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);

  //  FILTER STATE
  const [sourceFilter, setSourceFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  async function loadEnergy() {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getEnergy();
      setRecords(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load energy data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEnergy();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this record?")) return;
    await api.deleteEnergy(id);
    loadEnergy();
  }

  //  FILTERED DATA
  const filteredRecords = records.filter((r) => {
    if (sourceFilter !== "all" && r.source !== sourceFilter) return false;
    if (fromDate && r.date < fromDate) return false;
    if (toDate && r.date > toDate) return false;
    return true;
  });

  //  KPI CALCULATIONS
  const totalConsumption = filteredRecords.reduce(
    (sum, r) => sum + (r.consumption || 0),
    0,
  );

  const renewableConsumption = filteredRecords
    .filter((r) => r.source?.toLowerCase().includes("renewable"))
    .reduce((sum, r) => sum + (r.consumption || 0), 0);

  const renewablePercent =
    totalConsumption > 0
      ? Math.round((renewableConsumption / totalConsumption) * 100)
      : 0;

  //  ENERGY MIX (PIE)
  const sourceMap: Record<string, number> = {};
  filteredRecords.forEach((r) => {
    if (!r.source) return;
    sourceMap[r.source] = (sourceMap[r.source] || 0) + (r.consumption || 0);
  });

  const energyTypeData = Object.entries(sourceMap).map(([type, value]) => ({
    type,
    value,
  }));

  const colors = ["#10b981", "#059669", "#d1d5db", "#6ee7b7"];

  //  FACILITY DATA (BAR)
  const facilityMap: Record<string, number> = {};
  filteredRecords.forEach((r) => {
    if (!r.facility) return;
    facilityMap[r.facility] =
      (facilityMap[r.facility] || 0) + (r.consumption || 0);
  });

  const facilityData = Object.entries(facilityMap).map(([facility, kWh]) => ({
    facility,
    kWh,
  }));

  // EXPORT CSV
  function exportCSV() {
    if (!filteredRecords.length) return;

    const headers = ["Date", "Source", "Facility", "Consumption"];
    const rows = filteredRecords.map((r) => [
      r.date,
      r.source,
      r.facility,
      r.consumption,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "energy-records.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Energy Management</h1>
          <p className="text-gray-600">
            Monitor energy consumption and renewable energy progress
          </p>
        </div>

        {/* ACTIONS + FILTERS */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            className="border rounded px-2 py-1 text-sm"
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
          >
            <option value="all">All Sources</option>
            <option value="Electricity">Electricity</option>
            <option value="Renewable">Renewable</option>
            <option value="Natural Gas">Natural Gas</option>
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

          <Button variant="outline" onClick={exportCSV} className="gap-2">
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

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">
              Total Consumption
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {totalConsumption.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-2">kWh total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">
              Renewable Energy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{renewablePercent}%</div>
            <p className="text-xs text-green-600 mt-2">of total consumption</p>
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
            <p className="text-xs text-gray-500 mt-2">entries in database</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">
              Avg Consumption
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {filteredRecords.length
                ? Math.round(
                    totalConsumption / filteredRecords.length,
                  ).toLocaleString()
                : 0}
            </div>
            <p className="text-xs text-gray-500 mt-2">kWh per entry</p>
          </CardContent>
        </Card>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Energy Mix</CardTitle>
          </CardHeader>
          <CardContent>
            {energyTypeData.length === 0 ? (
              <p className="text-sm text-gray-500">No energy data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={energyTypeData}
                    dataKey="value"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {energyTypeData.map((_, index) => (
                      <Cell key={index} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Consumption by Facility</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={facilityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="facility" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="kWh" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* TABLE */}
      <Card>
        <CardHeader>
          <CardTitle>Energy Usage Log</CardTitle>
          <CardDescription>Recent energy entries</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-left py-3 px-4">Source</th>
                  <th className="text-left py-3 px-4">Facility</th>
                  <th className="text-right py-3 px-4">Consumption</th>
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
                      No energy records yet
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
                    <td className="py-3 px-4 text-right font-medium tabular-nums">
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

      <AddEnergyModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onCreated={loadEnergy}
      />
    </div>
  );
}
