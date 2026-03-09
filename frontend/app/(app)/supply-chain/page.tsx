"use client";

import AddSupplierModal from "@/components/add-supplier-modal";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Download } from "lucide-react";
import api, { Supplier } from "@/lib/api";

export default function SupplyChainPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);

  async function loadSuppliers() {
    try {
      setLoading(true);
      const data = await api.getSuppliers();
      setSuppliers(data || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSuppliers();
  }, []);

  async function handleAssess(id: string) {
    await api.assessSupplier(id);
    loadSuppliers();
  }

  const totalSuppliers = suppliers.length;
  const highRiskCount = suppliers.filter((s) => s.riskScore > 60).length;
  const certifiedCount = suppliers.filter(
    (s) => s.certifications?.length > 0,
  ).length;
  const totalCarbon = suppliers.reduce(
    (acc, s) => acc + (s.carbonFootprint || 0),
    0,
  );

  const getRiskColor = (score: number) => {
    if (score < 30) return "bg-green-100 text-green-700";
    if (score < 60) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  const getRiskLevel = (score: number) => {
    if (score < 30) return "Low";
    if (score < 60) return "Medium";
    return "High";
  };

  function calculateRisk(supplier: any) {
    let score = 0;

    if (supplier.carbonFootprint > 20000) score += 40;
    else if (supplier.carbonFootprint > 10000) score += 25;

    if (!supplier.certifications || supplier.certifications.length === 0) {
      score += 25;
    } else if (supplier.certifications.length === 1) {
      score += 10;
    }

    const last = new Date(supplier.lastAssessment);
    const now = new Date();
    const diffMonths =
      (now.getFullYear() - last.getFullYear()) * 12 +
      (now.getMonth() - last.getMonth());

    if (diffMonths > 12) score += 15;

    return Math.min(score, 100);
  }

  function handleAssess(supplier: any) {
    const score = calculateRisk(supplier);
    alert(`${supplier.name} risk score: ${score}/100`);
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Supply Chain</h1>
          <p className="text-gray-600">
            Monitor supplier sustainability and compliance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 bg-transparent">
            <Download className="h-4 w-4" /> Export
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700 gap-2"
            onClick={() => setOpenModal(true)}
          >
            <Plus className="h-4 w-4" /> Add Supplier
          </Button>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Kpi
          title="Total Suppliers"
          value={totalSuppliers}
          subtitle="Active relationships"
        />
        <Kpi
          title="Supply Chain Carbon"
          value={`${(totalCarbon / 1000).toFixed(1)}K`}
          subtitle="kg CO2e"
        />
        <Kpi
          title="Certified Suppliers"
          value={certifiedCount}
          subtitle="ISO / B Corp"
        />
        <Kpi
          title="High-Risk Suppliers"
          value={highRiskCount}
          subtitle="Require attention"
          danger
        />
      </div>

      {/* LIST */}
      <Card>
        <CardHeader>
          <CardTitle>Supplier Sustainability Profile</CardTitle>
          <CardDescription>
            Monitor supplier performance and risk levels
          </CardDescription>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-sm text-gray-500">Loading suppliers…</p>
          ) : suppliers.length === 0 ? (
            <p className="text-sm text-gray-500">No suppliers yet</p>
          ) : (
            <div className="space-y-4">
              {suppliers.map((supplier) => (
                <div
                  key={supplier.id}
                  className="p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                    <div>
                      <h3 className="font-semibold">{supplier.name}</h3>
                      <p className="text-sm text-gray-600">
                        {supplier.category}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Carbon Footprint</p>
                      <p className="font-semibold">
                        {supplier.carbonFootprint
                          ? `${(supplier.carbonFootprint / 1000).toFixed(1)}K kg`
                          : "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Certifications</p>
                      <div className="flex gap-1 flex-wrap mt-1">
                        {supplier.certifications?.length ? (
                          supplier.certifications.map((c) => (
                            <Badge
                              key={c}
                              variant="secondary"
                              className="text-xs"
                            >
                              {c}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-gray-500">None</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Last Assessment</p>
                      <p className="text-sm">
                        {supplier.lastAssessment || "Never"}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-gray-600">Risk Level</p>
                      <div
                        className={`inline-block px-3 py-1 rounded text-sm font-semibold ${getRiskColor(calculateRisk(supplier) || 0)}`}
                      >
                        {getRiskLevel(calculateRisk(supplier) || 0)}
                      </div>
                    </div>
                  </div>

                  {/* SCORE BAR */}
                  <div className="mt-3 pt-3 border-t flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-xs text-gray-600">Risk Score</p>
                        <p className="text-xs font-semibold">
                          {calculateRisk(supplier) || 0}/100
                        </p>
                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${calculateRisk(supplier) || 0}%` }}
                        />
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-4 bg-transparent"
                      onClick={() => handleAssess(supplier)}
                    >
                      Assess
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddSupplierModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onCreated={loadSuppliers}
      />
    </div>
  );
}

function Kpi({ title, value, subtitle, danger }: any) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-gray-600">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold ${danger ? "text-red-600" : ""}`}>
          {value}
        </div>
        <p className="text-xs text-gray-500 mt-2">{subtitle}</p>
      </CardContent>
    </Card>
  );
}
