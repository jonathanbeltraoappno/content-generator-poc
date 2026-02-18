import { createClient } from "@/lib/supabase/server";
import { ReviewTable } from "./review-table";

export default async function ReviewPage() {
  const supabase = await createClient();
  const { data: variants } = await supabase
    .from("content_variants")
    .select(
      "id, channel, audience, tone, status, generated_text, created_at, approved_content_id, approved_content(title)"
    )
    .order("created_at", { ascending: false });

  const withTitle = (variants ?? []).map((v) => ({
    ...v,
    sourceTitle: (v.approved_content as { title?: string } | null)?.title ?? "—",
  }));

  return (
    <div>
      <h1 className="text-2xl font-semibold">Review Variants</h1>
      <p className="text-muted-foreground mt-1">
        Update status: draft → in review → approve or reject.
      </p>
      {withTitle.length === 0 ? (
        <p className="text-muted-foreground mt-4">
          No variants yet. Generate some from the Generate page.
        </p>
      ) : (
        <ReviewTable variants={withTitle} />
      )}
    </div>
  );
}
