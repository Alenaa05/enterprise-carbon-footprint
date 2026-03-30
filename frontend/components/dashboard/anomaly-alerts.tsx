'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, TrendingUp, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api, { AlertRecord } from "@/lib/api";

export function AnomalyAlertsSection() {
  const router = useRouter();
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  async function loadAlerts() {
    try {
      setLoading(true);
      const data = await api.getAlerts();
      setAlerts(data || []);
    } catch (err) {
      console.error("Failed to load alerts", err);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAlerts();
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <AlertCircle className="h-4 w-4 text-destructive animate-pulse-subtle" />;
      case "investigating":
        return <Clock className="h-4 w-4 text-warning" />;
      case "pending_action":
        return <AlertCircle className="h-4 w-4 text-warning" />;
      case "resolved":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      default:
        return null;
    }
  };

  const activeAlerts = alerts.filter((a) => a.status !== "resolved");
  const resolvedAlerts = alerts.filter((a) => a.status === "resolved");

  return (
    <Card className="border-border/50 border-l-4 border-l-destructive/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Anomaly Detection & Alerts
            </CardTitle>
            <CardDescription className="mt-1">
              Real-time monitoring for emissions spikes, goal deviations, and compliance risks
            </CardDescription>
          </div>
          {activeAlerts.length > 0 && (
            <Badge variant="destructive" className="text-base px-3 py-1">
              {activeAlerts.length} Active
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {loading && (
            <div className="text-sm text-muted-foreground">Loading alerts...</div>
          )}

          {!loading && alerts.length === 0 && (
            <div className="text-sm text-muted-foreground">
              No alerts yet. Run anomaly detection to generate alerts.
            </div>
          )}

          {alerts.slice(0, 4).map((alert) => (
            <div
              key={alert.id}
              className={`border border-border/50 rounded-lg p-3 transition-colors ${
                alert.status === "resolved"
                  ? "bg-secondary/5 border-secondary/20"
                  : "hover:border-destructive/30"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-1">
                    {getStatusIcon(alert.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm text-foreground">{alert.title}</h4>
                      <Badge variant={getSeverityColor(alert.severity)} className="text-xs flex-shrink-0">
                        {alert.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <Badge variant="outline">{alert.affectedArea}</Badge>
                      <span className="text-muted-foreground">
                        {alert.createdAt
                          ? new Date(alert.createdAt).toLocaleString()
                          : ""}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
          <Button
            className="w-full"
            variant="outline"
            disabled={running}
            onClick={async () => {
              setRunning(true);
              try {
                await api.checkAnomalies();
                await loadAlerts();
              } catch (err) {
                console.error("Anomaly check failed", err);
              } finally {
                setRunning(false);
              }
            }}
          >
            {running ? "Checking..." : "Run Anomaly Detection"}
          </Button>
          <Button
            className="w-full"
            variant="outline"
            onClick={() => router.push("/carbon")}
          >
            View All Alerts ({alerts.length})
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
