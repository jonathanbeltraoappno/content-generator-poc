import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { updateVariantStatusAction } from "./actions";

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
        <p className="text-muted-foreground mt-4">No variants yet. Generate some from the Generate page.</p>
      ) : (
        <Table className="mt-6">
          <TableHeader>
            <TableRow>
              <TableHead>Source</TableHead>
              <TableHead>Channel</TableHead>
              <TableHead>Audience</TableHead>
              <TableHead>Tone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Preview</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {withTitle.map((v) => (
              <TableRow key={v.id}>
                <TableCell>
                  <Link
                    href={`/library/${v.approved_content_id}/edit`}
                    className="text-primary hover:underline"
                  >
                    {v.sourceTitle}
                  </Link>
                </TableCell>
                <TableCell>{v.channel}</TableCell>
                <TableCell>{v.audience}</TableCell>
                <TableCell>{v.tone}</TableCell>
                <TableCell>{v.status}</TableCell>
                <TableCell className="max-w-[200px] truncate">{v.generated_text}</TableCell>
                <TableCell className="text-right">
                  <form
                    key={v.id}
                    className="inline-flex gap-1 flex-wrap justify-end"
                    action={updateVariantStatusAction}
                  >
                    <input type="hidden" name="variantId" value={v.id} />
                    {v.status === "draft" && (
                      <Button type="submit" name="status" value="in_review" size="sm" variant="outline">
                        Submit for review
                      </Button>
                    )}
                    {(v.status === "draft" || v.status === "in_review") && (
                      <>
                        <Button type="submit" name="status" value="approved" size="sm">
                          Approve
                        </Button>
                        <Button type="submit" name="status" value="rejected" size="sm" variant="destructive">
                          Reject
                        </Button>
                      </>
                    )}
                  </form>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
