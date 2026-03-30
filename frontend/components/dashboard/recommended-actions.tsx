'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Lightbulb, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api, { RecommendationRecord } from "@/lib/api";

export function RecommendedActionsSection() {
  const router = useRouter();
  const [recommendedActions, setRecommendedActions] = useState<
    RecommendationRecord[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await api.getRecommendations();
        setRecommendedActions(data || []);
      } catch (err) {
        console.error("Failed to load recommendations", err);
        setRecommendedActions([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "warning";
      case "low":
        return "secondary";
      default:
        return "secondary";
    }
  };

  return (
    <Card className="border-border/50 border-l-4 border-l-secondary/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-secondary" />
              Recommended Priority Actions
            </CardTitle>
            <CardDescription className="mt-1">
              AI-powered recommendations ranked by impact and ROI
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading && (
            <p className="text-sm text-muted-foreground">
              Loading recommendations...
            </p>
          )}
          {!loading && recommendedActions.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No recommendations yet.
            </p>
          )}
          {recommendedActions.map((action) => (
            <div
              key={action.id}
              className="border border-border/50 rounded-lg p-4 hover:border-secondary/30 transition-colors group"
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-foreground">{action.title}</h4>
                    <Badge variant={getPriorityColor(action.priority)} className="text-xs">
                      {action.priority.charAt(0).toUpperCase() + action.priority.slice(1)} Priority
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </div>
                <TrendingUp className="h-5 w-5 text-secondary opacity-40 flex-shrink-0 group-hover:opacity-60 transition-opacity" />
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-border/30">
                <div>
                  <span className="text-xs font-medium text-muted-foreground">Annual Savings: </span>
                  <span className="text-sm font-semibold text-secondary">{action.savings}</span>
                </div>
                <div>
                  <span className="text-xs font-medium text-muted-foreground">Impact: </span>
                  <span className="text-sm font-semibold text-foreground">{action.impact}</span>
                </div>
                <div className="ml-auto">
                  <Badge variant="outline" className="text-xs">
                    {action.category}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
        <Button
          className="w-full mt-4"
          variant="secondary"
          onClick={() => router.push("/compliance")}
        >
          View All Recommendations
        </Button>
      </CardContent>
    </Card>
  );
}
