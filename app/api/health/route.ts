import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const checks: { name: string; status: "ok" | "error"; message?: string }[] = [];

  // Supabase
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.getSession();
    if (error) {
      checks.push({ name: "supabase", status: "error", message: error.message });
    } else {
      checks.push({ name: "supabase", status: "ok" });
    }
  } catch (err) {
    checks.push({
      name: "supabase",
      status: "error",
      message: err instanceof Error ? err.message : "Connection failed",
    });
  }

  // n8n webhook URL
  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  if (!webhookUrl || webhookUrl.trim() === "") {
    checks.push({
      name: "n8n",
      status: "error",
      message: "N8N_WEBHOOK_URL is not set. Add it to .env.local.",
    });
  } else {
    checks.push({
      name: "n8n",
      status: "ok",
      message: "Webhook URL configured. Ensure the n8n workflow is active.",
    });
  }

  const allOk = checks.every((c) => c.status === "ok");
  return NextResponse.json(
    { ok: allOk, checks },
    { status: allOk ? 200 : 503 }
  );
}
