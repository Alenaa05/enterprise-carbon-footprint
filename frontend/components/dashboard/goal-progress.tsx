'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, TrendingDown, AlertCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import api, { Goal } from "@/lib/api";

export function GoalProgressSection() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await api.getGoals();
        setGoals((data || []).slice(0, 4));
      } catch (err) {
        console.error("Failed to load goals for dashboard section", err);
        setGoals([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const derived = useMemo(() => {
    return goals.map((g) => {
      const deadline = new Date(g.deadline);
      const now = new Date();
      const yearsRemaining = Math.max(
        0,
        (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 365),
      );
      const timeRemaining =
        yearsRemaining >= 1
          ? `${yearsRemaining.toFixed(1)} years`
          : `${Math.ceil(yearsRemaining * 12)} months`;

      return {
        id: g.id!,
        title: g.title,
        target: `${g.target} ${g.unit} by ${new Date(g.deadline).getFullYear()}`,
        current: `${g.progress}% complete`,
        progress: Math.min(g.progress, 100),
        status:
          g.status === "on-track"
            ? "on_track"
            : g.status === "at-risk"
              ? "at_risk"
              : "behind",
        timeRemaining,
      };
    });
  }, [goals]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "on_track":
        return "success";
      case "at_risk":
        return "warning";
      case "behind":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getProgressBarColor = (status: string) => {
    switch (status) {
      case "on_track":
        return "bg-gradient-to-r from-green-500 to-green-600";
      case "at_risk":
        return "bg-gradient-to-r from-amber-500 to-amber-600";
      case "behind":
        return "bg-gradient-to-r from-red-500 to-red-600";
      default:
        return "bg-primary";
    }
  };

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Goal Progress Tracking
            </CardTitle>
            <CardDescription className="mt-1">
              Track progress toward your sustainability targets
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {loading && (
            <p className="text-sm text-muted-foreground">Loading goals...</p>
          )}
          {!loading && derived.length === 0 && (
            <p className="text-sm text-muted-foreground">No goals yet.</p>
          )}
          {derived.map((goal) => (
            <div key={goal.id} className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-foreground">{goal.title}</h4>
                    <Badge variant={getStatusColor(goal.status)} className="text-xs">
                      {goal.status === "on_track"
                        ? "On Track"
                        : goal.status === "at_risk"
                        ? "At Risk"
                        : "Behind"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{goal.target}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-lg font-bold text-foreground">{goal.progress}%</div>
                  <div className="text-xs text-muted-foreground">{goal.timeRemaining} left</div>
                </div>
              </div>
              
              <div className="space-y-1.5">
                <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${getProgressBarColor(goal.status)}`}
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{goal.current}</span>
                </p>
              </div>

              {goal.status === "at_risk" && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-warning/10 border border-warning/20">
                  <AlertCircle className="h-4 w-4 text-warning flex-shrink-0" />
                  <p className="text-xs text-warning-foreground">
                    Increase pace by {Math.ceil(goal.progress * 1.5) - goal.progress}% to stay on target
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          <h4 className="font-semibold text-sm text-foreground mb-3">Key Insights</h4>
          {derived.length === 0 ? (
            <p className="text-sm text-muted-foreground">Add goals to see insights.</p>
          ) : (
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-primary" />
                {derived.filter(g => g.status === "on_track").length} of {derived.length} goal{derived.length !== 1 ? "s" : ""} on track
              </li>
              {derived.filter(g => g.status === "at_risk" || g.status === "behind").map(g => (
                <li key={g.id} className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-warning" />
                  <span><strong>{g.title}</strong> needs attention</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
