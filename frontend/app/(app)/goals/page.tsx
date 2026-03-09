"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Download, Filter, TrendingUp, Target } from "lucide-react";

import api, { Goal, Emission, EnergyRecord } from "@/lib/api";
import AddGoalModal from "@/components/add-goal-modal";

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [filteredGoals, setFilteredGoals] = useState<Goal[]>([]);
  const [filterCategory, setFilterCategory] = useState("all");

  const [goalModalOpen, setGoalModalOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<{
    emissions: Emission[];
    energy: EnergyRecord[];
  }>({ emissions: [], energy: [] });
  const [autoUpdated, setAutoUpdated] = useState(false);

  useEffect(() => {
    loadGoals();
  }, []);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const [emissions, energy] = await Promise.all([
          api.getEmissions(),
          api.getEnergy(),
        ]);
        setMetrics({ emissions: emissions || [], energy: energy || [] });
      } catch (err) {
        console.error("Failed to load metrics for goals", err);
      }
    }
    loadMetrics();
  }, []);

  useEffect(() => {
    if (filterCategory === "all") {
      setFilteredGoals(goals);
    } else {
      setFilteredGoals(goals.filter((g) => g.category === filterCategory));
    }
  }, [goals, filterCategory]);

  async function loadGoals() {
    setLoading(true);

    const data = await api.getGoals();

    setGoals(data || []);

    setLoading(false);
  }

  const aggregated = useMemo(() => {
    const totalEmissions = metrics.emissions.reduce(
      (sum, e) => sum + (e.amount || 0),
      0,
    );
    const totalEnergy = metrics.energy.reduce(
      (sum, r) => sum + (r.consumption || 0),
      0,
    );
    const renewableEnergy = metrics.energy
      .filter((r) => r.source?.toLowerCase().includes("renewable"))
      .reduce((sum, r) => sum + (r.consumption || 0), 0);

    const renewableShare =
      totalEnergy > 0 ? Math.round((renewableEnergy / totalEnergy) * 100) : 0;

    return { totalEmissions, totalEnergy, renewableShare };
  }, [metrics]);

  useEffect(() => {
    // simple placeholder “ML” progression model; only run once when data is ready
    if (autoUpdated || goals.length === 0) return;
    if (!metrics.emissions.length && !metrics.energy.length) return;

    async function updateFromModel() {
      try {
        const updates = goals.map((g) => {
          let progress = g.progress;

          if (g.category === "carbon") {
            // assume target is reduction vs current total emissions
            const baseline = aggregated.totalEmissions || 1;
            const targetReduction = g.target || 0;
            const achieved = Math.min(
              (targetReduction / baseline) * 100,
              100,
            );
            progress = Math.round(achieved);
          } else if (g.category === "energy") {
            // map progress to renewable share vs target %
            const targetShare = g.target || 100;
            if (targetShare > 0) {
              const achieved = Math.min(
                (aggregated.renewableShare / targetShare) * 100,
                100,
              );
              progress = Math.round(achieved);
            }
          }

          let status: Goal["status"] = "on-track";
          if (progress < 40) status = "behind";
          else if (progress < 70) status = "at-risk";

          return { id: g.id!, progress, status };
        });

        await Promise.all(
          updates.map((u) => api.updateGoal(u.id, u.progress)),
        );

        // refresh goals with updated progress
        await loadGoals();
      } catch (err) {
        console.error("Auto-progress update failed", err);
      } finally {
        setAutoUpdated(true);
      }
    }

    updateFromModel();
  }, [goals, metrics, aggregated, autoUpdated]);

  function exportGoals() {
    const csv = [
      ["Title", "Category", "Target", "Unit", "Progress", "Deadline"],
      ...goals.map((g) => [
        g.title,
        g.category,
        g.target,
        g.unit,
        g.progress,
        g.deadline,
      ]),
    ]
      .map((r) => r.join(","))
      .join("\n");

    const blob = new Blob([csv]);
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "goals.csv";
    a.click();
  }

  async function editProgress(id: string) {
    const progress = prompt("Enter new progress %");

    if (!progress) return;

    await api.updateGoal(id, Number(progress));

    loadGoals();
  }

  const onTrack = goals.filter((g) => g.status === "on-track").length;
  const atRisk = goals.filter((g) => g.status === "at-risk").length;
  const behind = goals.filter((g) => g.status === "behind").length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "on-track":
        return "bg-green-100 text-green-700";

      case "at-risk":
        return "bg-yellow-100 text-yellow-700";

      case "behind":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "on-track":
        return "On Track";

      case "at-risk":
        return "At Risk";

      case "behind":
        return "Behind";

      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Goals & Targets</h1>
          <p className="text-gray-600">
            Track sustainability targets and team progress
          </p>
        </div>

        <div className="flex gap-2">
          <select
            className="border rounded p-2"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">All</option>
            <option value="carbon">Carbon</option>
            <option value="energy">Energy</option>
            <option value="waste">Waste</option>
          </select>

          <Button
            variant="outline"
            className="gap-2 bg-transparent"
            onClick={exportGoals}
          >
            <Download className="h-4 w-4" /> Export
          </Button>

          <Button
            className="bg-green-600 hover:bg-green-700 gap-2"
            onClick={() => setGoalModalOpen(true)}
          >
            <Plus className="h-4 w-4" /> New Goal
          </Button>
        </div>
      </div>

      {/* KPI */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{goals.length}</div>
            <p className="text-xs text-gray-500 mt-2">
              Active sustainability goals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              On Track
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{onTrack}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              At Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{atRisk}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Behind Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{behind}</div>
          </CardContent>
        </Card>
      </div>

      {/* GOALS */}

      <Card>
        <CardHeader>
          <CardTitle>Organizational Goals</CardTitle>
          <CardDescription>Long-term sustainability targets</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {loading && <p>Loading goals...</p>}

          {filteredGoals.map((goal) => {
            const yearsRemaining = Math.ceil(
              (new Date(goal.deadline).getTime() - new Date().getTime()) /
                (1000 * 60 * 60 * 24 * 365),
            );

            return (
              <div key={goal.id} className="border-b pb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-600" />
                    <h3 className="text-lg font-semibold">{goal.title}</h3>
                  </div>

                  <Badge className={getStatusColor(goal.status)}>
                    {getStatusLabel(goal.status)}
                  </Badge>
                </div>

                <p className="text-sm text-gray-600 mb-2">
                  Target: {goal.target} {goal.unit} • Deadline: {goal.deadline}
                </p>

                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="h-3 bg-green-600 rounded-full"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>

                <div className="flex justify-between mt-3 text-sm">
                  <div>
                    Category: <b>{goal.category}</b>
                  </div>

                  <div>
                    Years Remaining: <b>{yearsRemaining}</b>
                  </div>

                  <div>
                    Progress: <b>{goal.progress}%</b>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => editProgress(goal.id!)}
                  >
                    Edit
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* ACTIONS */}

      <Card>
        <CardHeader>
          <CardTitle>Recommended Actions</CardTitle>
          <CardDescription>
            Steps to accelerate progress toward goals
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="p-3 border rounded-lg">
            <TrendingUp className="inline mr-2 text-green-600" />
            Accelerate renewable energy deployment
          </div>

          <div className="p-3 border rounded-lg">
            <TrendingUp className="inline mr-2 text-yellow-600" />
            Strengthen waste reduction initiatives
          </div>

          <div className="p-3 border rounded-lg">
            <TrendingUp className="inline mr-2 text-green-600" />
            Supply chain carbon accounting
          </div>
        </CardContent>
      </Card>

      <AddGoalModal
        open={goalModalOpen}
        onClose={() => setGoalModalOpen(false)}
        onCreated={loadGoals}
      />
    </div>
  );
}
