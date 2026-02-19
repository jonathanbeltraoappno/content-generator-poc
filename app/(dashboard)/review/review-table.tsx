"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ContentPreviewSheet } from "@/components/content-preview-sheet";
import { updateVariantStatusAction, updateVariantStatusBulkAction } from "./actions";

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
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [audienceFilter, setAudienceFilter] = useState<string>("all");
  const [toneFilter, setToneFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return variants.filter((v) => {
      if (statusFilter !== "all" && v.status !== statusFilter) return false;
      if (channelFilter !== "all" && v.channel !== channelFilter) return false;
      if (audienceFilter !== "all" && v.audience !== audienceFilter) return false;
      if (toneFilter !== "all" && v.tone !== toneFilter) return false;
      if (search.trim() && !v.sourceTitle.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [variants, statusFilter, channelFilter, audienceFilter, toneFilter, search]);

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((v) => v.id)));
  };

  const bulkDraft = filtered.filter((v) => selected.has(v.id) && v.status === "draft");
  const bulkReviewable = filtered.filter((v) => selected.has(v.id) && (v.status === "draft" || v.status === "in_review"));

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          type="search"
          placeholder="Search source..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="in_review">In review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select value={channelFilter} onValueChange={setChannelFilter}>
          <SelectTrigger className="w-[110px]">
            <SelectValue placeholder="Channel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All channels</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="web">Web</SelectItem>
            <SelectItem value="sms">SMS</SelectItem>
          </SelectContent>
        </Select>
        <Select value={audienceFilter} onValueChange={setAudienceFilter}>
          <SelectTrigger className="w-[110px]">
            <SelectValue placeholder="Audience" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All audiences</SelectItem>
            <SelectItem value="hcp">HCP</SelectItem>
            <SelectItem value="patient">Patient</SelectItem>
            <SelectItem value="internal">Internal</SelectItem>
          </SelectContent>
        </Select>
        <Select value={toneFilter} onValueChange={setToneFilter}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Tone" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All tones</SelectItem>
            <SelectItem value="professional">Professional</SelectItem>
            <SelectItem value="friendly">Friendly</SelectItem>
            <SelectItem value="formal">Formal</SelectItem>
            <SelectItem value="conversational">Conversational</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">
          {filtered.length} of {variants.length}
        </span>
      </div>
      {selected.size > 0 && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border bg-muted/50 p-3">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <form action={updateVariantStatusBulkAction} className="inline-flex gap-1">
            <input type="hidden" name="variantIds" value={JSON.stringify([...selected])} />
            {bulkDraft.length > 0 && (
              <Button type="submit" name="status" value="in_review" size="sm" variant="outline">
                Submit for review
              </Button>
            )}
            {bulkReviewable.length > 0 && (
              <>
                <Button type="submit" name="status" value="approved" size="sm">
                  Approve
                </Button>
                <Button type="submit" name="status" value="rejected" size="sm" variant="destructive">
                  Reject
                </Button>
              </>
            )}
            <Button type="button" variant="ghost" size="sm" onClick={() => setSelected(new Set())}>
              Clear
            </Button>
          </form>
        </div>
      )}
      <Table className="mt-6">
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <input
                type="checkbox"
                checked={selected.size === filtered.length && filtered.length > 0}
                onChange={toggleAll}
                className="h-4 w-4 rounded border-input"
              />
            </TableHead>
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
          {filtered.map((v) => (
            <TableRow key={v.id}>
              <TableCell>
                <input
                  type="checkbox"
                  checked={selected.has(v.id)}
                  onChange={() => toggleOne(v.id)}
                  className="h-4 w-4 rounded border-input"
                />
              </TableCell>
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
