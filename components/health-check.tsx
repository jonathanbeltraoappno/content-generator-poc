"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Check = { name: string; status: "ok" | "error"; message?: string };

export function HealthCheck() {
  const [data, setData] = useState<{ ok: boolean; checks: Check[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData({ ok: false, checks: [{ name: "fetch", status: "error", message: "Could not reach health endpoint" }] }))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) return null;

  return (
    <Card className="mb-6 max-w-xl border-muted">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">System status</CardTitle>
        <CardDescription>Verify connectivity before generating.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-1.5 text-sm">
          {data.checks.map((c) => (
            <li key={c.name} className="flex items-center gap-2">
              <span
                className={`inline-block h-2 w-2 rounded-full ${c.status === "ok" ? "bg-green-500" : "bg-destructive"}`}
              />
              <span className="capitalize">{c.name}:</span>
              <span className={c.status === "ok" ? "text-muted-foreground" : "text-destructive"}>
                {c.status === "ok" ? "OK" : c.message ?? "Error"}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
