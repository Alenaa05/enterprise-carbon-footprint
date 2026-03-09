"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Download, Filter, FileText, Share2, Eye } from "lucide-react";
import { mockReport } from "@/lib/mock-data";
import api, { Emission, EnergyRecord, Report, WaterRecord, WasteRecord } from "@/lib/api";
import { useEffect, useMemo, useState } from "react";

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  async function loadReports() {
    try {
      setLoading(true);
      const data = await api.getReports();
      const sorted = (data || []).sort(
        (a, b) => new Date(b.generated).getTime() - new Date(a.generated).getTime(),
      );
      setReports(sorted);
    } catch (err) {
      console.error("Failed to load reports", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  const totalDownloads = useMemo(
    () => reports.reduce((acc, r) => acc + (r.downloads || 0), 0),
    [reports],
  );

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "quarterly":
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
            Quarterly
          </Badge>
        );
      case "annual":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            Annual
          </Badge>
        );
      case "compliance":
        return (
          <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">
            Compliance
          </Badge>
        );
      case "sustainability":
        return (
          <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-100">
            Sustainability
          </Badge>
        );
      default:
        return <Badge>Report</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "published") {
      return (
        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
          Published
        </Badge>
      );
    }
    return (
      <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
        Draft
      </Badge>
    );
  };

  async function handleExport() {
    try {
      const res = await api.exportReports();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "reports.html";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Export failed", err);
    }
  }

  async function handleGenerate() {
    try {
      setGenerating(true);

      const [emissions, energy, water, waste] = await Promise.all([
        api.getEmissions(),
        api.getEnergy(),
        api.getWater(),
        api.getWaste(),
      ]);

      const totalEmissions = (emissions || []).reduce(
        (sum: number, r: Emission) => sum + (r.amount || 0),
        0,
      );

      const totalEnergy = (energy || []).reduce(
        (sum: number, r: EnergyRecord) => sum + (r.consumption || 0),
        0,
      );

      const renewableEnergy = (energy || [])
        .filter((r: EnergyRecord) =>
          r.source?.toLowerCase().includes("renewable"),
        )
        .reduce((sum: number, r: EnergyRecord) => sum + (r.consumption || 0), 0);

      const renewableEnergyPercent =
        totalEnergy > 0 ? Math.round((renewableEnergy / totalEnergy) * 100) : 0;

      const totalWater = (water || []).reduce(
        (sum: number, r: WaterRecord) => sum + (r.consumption || 0),
        0,
      );

      const totalWaste = (waste || []).reduce(
        (sum: number, r: WasteRecord) => sum + (r.amount || 0),
        0,
      );

      const recycledWaste = (waste || [])
        .filter((r: any) => (r.type || "").toLowerCase() === "recycled")
        .reduce((sum: number, r: WasteRecord) => sum + (r.amount || 0), 0);

      const wasteRecycledPercent =
        totalWaste > 0 ? Math.round((recycledWaste / totalWaste) * 100) : 0;

      const now = new Date();
      const month = now.toLocaleString("default", { month: "short" });
      const year = now.getFullYear();

      await api.generateReport({
        title: `${month} ${year} Sustainability Report`,
        type: "sustainability",
        status: "published",
        emissions: totalEmissions,
        renewableEnergy: renewableEnergyPercent,
        waterUsage: totalWater,
        wasteRecycled: wasteRecycledPercent,
      } as any);

      await loadReports();
    } catch (err) {
      console.error("Generate report failed", err);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-gray-600">
            Generate and manage sustainability reports
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 bg-transparent">
            <Filter className="h-4 w-4" /> Filter
          </Button>
          <Button variant="outline" className="gap-2 bg-transparent" onClick={handleExport}>
            <Download className="h-4 w-4" /> Export
          </Button>
          <Button className="bg-green-600 hover:bg-green-700 gap-2" onClick={handleGenerate} disabled={generating}>
            <Plus className="h-4 w-4" /> Generate Report
          </Button>
        </div>
      </div>

      {/* Report Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{reports.length}</div>
            <p className="text-xs text-gray-500 mt-2">Generated</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Published
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {reports.filter((r) => r.status === "published").length}
            </div>
            <p className="text-xs text-gray-500 mt-2">Public reports</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Downloads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {totalDownloads}
            </div>
            <p className="text-xs text-gray-500 mt-2">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Last Generated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {reports[0]?.generated
                ? new Date(reports[0].generated).toLocaleString("default", {
                    month: "short",
                  })
                : "-"}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {reports[0]?.generated ? new Date(reports[0].generated).getFullYear() : ""}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Report List */}
      <Card>
        <CardHeader>
          <CardTitle>All Reports</CardTitle>
          <CardDescription>
            View, download, and manage all sustainability reports
          </CardDescription>
        </CardHeader>
          <CardContent>
          <div className="space-y-3">
            {loading && (
              <p className="text-sm text-gray-500">Loading reports...</p>
            )}
            {!loading && reports.length === 0 && (
              <p className="text-sm text-gray-500">No reports yet</p>
            )}
            {reports.map((report) => (
              <div
                key={report.id}
                className="p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <FileText className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold">{report.title}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(report.generated).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {getTypeBadge((report as any).type || "sustainability")}
                    {getStatusBadge((report as any).status || "published")}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Type</p>
                    <p className="text-sm font-semibold capitalize">
                      {(report as any).type?.replace("-", " ") || "report"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Generated</p>
                    <p className="text-sm font-semibold">
                      {new Date(report.generated).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Status</p>
                    <p className="text-sm font-semibold capitalize">
                      {(report as any).status || ((report.downloads || 0) > 0 ? "published" : "draft")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Downloads</p>
                    <p className="text-sm font-semibold">
                      {report.downloads || 0}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-transparent"
                  onClick={async () => {
                    try {
                      const res = await api.downloadReport(report.id!);
                      const blob = await res.blob();
                      const url = URL.createObjectURL(blob);
                      window.open(url, "_blank");
                    } catch (err) {
                      console.error("Download failed", err);
                    }
                  }}
                >
                  <Eye className="h-4 w-4" /> View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-transparent"
                  onClick={async () => {
                    try {
                      const res = await api.downloadReport(report.id!);
                      const blob = await res.blob();
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.href = url;
                      link.download = `${report.title}.html`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    } catch (err) {
                      console.error("Download failed", err);
                    }
                  }}
                >
                  <Download className="h-4 w-4" /> Download
                </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 bg-transparent"
                  >
                    <Share2 className="h-4 w-4" /> Share
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Latest Report Preview */}
      <Card>
        <CardHeader>
          <CardTitle>
            Latest Report:{" "}
            {reports[0]?.generated
              ? `${new Date(reports[0].generated).toLocaleString("default", {
                  month: "short",
                })} ${new Date(reports[0].generated).getFullYear()}`
              : `${mockReport.period} ${mockReport.type}`}
          </CardTitle>
          <CardDescription>
            Generated on{" "}
            {reports[0]?.generated
              ? new Date(reports[0].generated).toLocaleDateString()
              : mockReport.generatedAt}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Key Metrics */}
            <div>
              <h3 className="font-semibold mb-3">Key Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Carbon Emissions</p>
                  <p className="text-2xl font-bold text-green-600">
                    {(
                      ((reports[0]?.emissions ?? mockReport.data.carbonEmissions) as number) /
                      1000000
                    ).toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">kg CO2e</p>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Energy Usage</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {(mockReport.data.energyUsage / 1000).toFixed(0)}K
                  </p>
                  <p className="text-xs text-gray-600 mt-1">kWh</p>
                </div>

                <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Water Usage</p>
                  <p className="text-2xl font-bold text-cyan-600">
                    {(
                      ((reports[0]?.waterUsage ?? mockReport.data.waterUsage) as number) /
                      1000
                    ).toFixed(0)}K
                  </p>
                  <p className="text-xs text-gray-600 mt-1">liters</p>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Waste Generated</p>
                  <p className="text-2xl font-bold text-amber-600">
                    {(mockReport.data.wasteGenerated / 1000).toFixed(1)}K
                  </p>
                  <p className="text-xs text-gray-600 mt-1">kg</p>
                </div>
              </div>
            </div>

            {/* Key Insights */}
            <div>
              <h3 className="font-semibold mb-3">Key Insights</h3>
              <ul className="space-y-2">
                {mockReport.data.keyInsights.map((insight, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="text-green-600 font-bold">•</span>
                    <span className="text-gray-700">{insight}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommendations */}
            <div>
              <h3 className="font-semibold mb-3">Recommendations</h3>
              <ul className="space-y-2">
                {mockReport.data.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="text-blue-600 font-bold">→</span>
                    <span className="text-gray-700">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                className="bg-green-600 hover:bg-green-700 gap-2"
              >
                <Download className="h-4 w-4" /> Download PDF
              </Button>
              <Button variant="outline" className="gap-2 bg-transparent">
                <Share2 className="h-4 w-4" /> Share Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
