import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

const CHANNELS = ["email", "web", "sms"] as const;
const AUDIENCES = ["hcp", "patient", "internal"] as const;
const TONES = ["professional", "friendly", "formal", "conversational"] as const;

function mapN8nError(status: number, body: string): string {
  if (status === 404) {
    return "n8n webhook not found. Activate the workflow in n8n and ensure the webhook path matches N8N_WEBHOOK_URL.";
  }
  if (status === 403) {
    return "n8n returned Forbidden. Check credentials (e.g. Requesty API key) in your n8n workflow.";
  }
  if (status === 401) {
    return "n8n returned Unauthorized. Verify API keys in your n8n workflow.";
  }
  try {
    const parsed = JSON.parse(body) as { message?: string; hint?: string };
    const msg = parsed.message ?? parsed.hint;
    if (msg) return msg;
  } catch {
    /* ignore */
  }
  return `Variant service returned ${status}. ${body.slice(0, 150)}`;
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const approvedContentId = b.approved_content_id as string | undefined;
  const channel = b.channel as string | undefined;
  const audience = b.audience as string | undefined;
  const tone = b.tone as string | undefined;

  if (
    !approvedContentId ||
    !channel ||
    !audience ||
    !tone ||
    !CHANNELS.includes(channel as (typeof CHANNELS)[number]) ||
    !AUDIENCES.includes(audience as (typeof AUDIENCES)[number]) ||
    !TONES.includes(tone as (typeof TONES)[number])
  ) {
    return NextResponse.json(
      { error: "approved_content_id, channel, audience, and tone are required and valid." },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { data: content, error: fetchError } = await supabase
    .from("approved_content")
    .select("id, title, body")
    .eq("id", approvedContentId)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !content) {
    return NextResponse.json({ error: "Content not found or access denied." }, { status: 404 });
  }

  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  if (!webhookUrl) {
    return NextResponse.json(
      { error: "Variant generation is not configured (N8N_WEBHOOK_URL)." },
      { status: 503 }
    );
  }

  // n8n webhook expects: baseContent, targetAudience, channel, tone
  const baseContent =
    (content.title ? `${content.title}\n\n` : "") + (content.body ?? "");
  const payload = {
    baseContent,
    targetAudience: audience,
    channel,
    tone,
  };

  let res: Response;
  try {
    res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(60000),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Network error";
    return NextResponse.json(
      { error: "Failed to call variant service: " + message },
      { status: 502 }
    );
  }

  if (!res.ok) {
    const text = await res.text();
    const friendly = mapN8nError(res.status, text);
    return NextResponse.json({ error: friendly }, { status: 502 });
  }

  let data: {
    variants?: Array<{ channel?: string; audience?: string; tone?: string; text: string }>;
    text?: string;
    output?: string;
    result?: string;
    error?: string;
  };
  try {
    data = await res.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON response from variant service." },
      { status: 502 }
    );
  }

  if (data.error) {
    return NextResponse.json({ error: data.error }, { status: 400 });
  }

  // Support both: { variants: [{ text }] } or single { text } / { output } / { result }
  let variants: Array<{ channel?: string; audience?: string; tone?: string; text: string }> =
    data.variants ?? [];
  if (variants.length === 0) {
    const singleText =
      typeof data.text === "string"
        ? data.text
        : typeof data.output === "string"
          ? data.output
          : typeof data.result === "string"
            ? data.result
            : "";
    if (singleText) {
      variants = [{ channel, audience, tone, text: singleText }];
    }
  }
  if (variants.length === 0) {
    return NextResponse.json(
      { error: "No variants returned from variant service." },
      { status: 502 }
    );
  }

  const rows = variants.map((v) => ({
    approved_content_id: approvedContentId,
    channel: v.channel ?? channel,
    audience: v.audience ?? audience,
    tone: v.tone ?? tone,
    status: "draft",
    generated_text: v.text ?? "",
  }));

  const { error: insertError } = await supabase.from("content_variants").insert(rows);

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, count: rows.length });
}
