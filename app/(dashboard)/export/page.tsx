import { createClient } from "@/lib/supabase/server";
import { ExportList } from "./export-list";

export default async function ExportPage() {
  const supabase = await createClient();
  const { data: variants } = await supabase
    .from("content_variants")
    .select(
      "id, channel, audience, tone, generated_text, approved_content(title)"
    )
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  const withTitle = (variants ?? []).map((v) => ({
    id: v.id,
    channel: v.channel,
    audience: v.audience,
    tone: v.tone,
    generated_text: v.generated_text,
    sourceTitle: (v.approved_content as { title?: string } | null)?.title ?? "—",
  }));

  return (
    <div>
      <h1 className="text-2xl font-semibold">Export</h1>
      <p className="text-muted-foreground mt-1">
        Copy or download approved variants.
      </p>
      <ExportList variants={withTitle} className="mt-6" />
    </div>
  );
}
