"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ContentPreviewSheet } from "@/components/content-preview-sheet";
import { updateVariantStatusAction } from "./actions";

type Variant = {
  id: string;
  channel: string;
  audience: string;
  tone: string;
  status: string;
  generated_text: string;
  approved_content_id: string;
  sourceTitle: string;
};

const statusStyles: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  in_review: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  approved: "bg-green-500/10 text-green-700 dark:text-green-400",
  rejected: "bg-destructive/10 text-destructive",
};

function StatusBadge({ status }: { status: string }) {
  const style = statusStyles[status] ?? "bg-muted text-muted-foreground";
  const label = status.replace("_", " ");
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium capitalize ${style}`}
    >
      {label}
    </span>
  );
}

export function ReviewTable({ variants }: { variants: Variant[] }) {
  const [previewVariant, setPreviewVariant] = useState<Variant | null>(null);

  return (
    <>
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
          {variants.map((v) => (
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
              <TableCell>
                <StatusBadge status={v.status} />
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreviewVariant(v)}
                >
                  Preview
                </Button>
              </TableCell>
              <TableCell className="text-right">
                <form
                  key={v.id}
                  className="inline-flex gap-1 flex-wrap justify-end"
                  action={updateVariantStatusAction}
                >
                  <input type="hidden" name="variantId" value={v.id} />
                  {v.status === "draft" && (
                    <Button
                      type="submit"
                      name="status"
                      value="in_review"
                      size="sm"
                      variant="outline"
                    >
                      Submit for review
                    </Button>
                  )}
                  {(v.status === "draft" || v.status === "in_review") && (
                    <>
                      <Button
                        type="submit"
                        name="status"
                        value="approved"
                        size="sm"
                      >
                        Approve
                      </Button>
                      <Button
                        type="submit"
                        name="status"
                        value="rejected"
                        size="sm"
                        variant="destructive"
                      >
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
      <ContentPreviewSheet
        open={!!previewVariant}
        onOpenChange={(open) => !open && setPreviewVariant(null)}
        text={previewVariant?.generated_text ?? ""}
        channel={previewVariant?.channel}
        audience={previewVariant?.audience}
        tone={previewVariant?.tone}
        sourceTitle={previewVariant?.sourceTitle}
      />
    </>
  );
}
