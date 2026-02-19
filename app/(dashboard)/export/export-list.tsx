"use client";

import { useState, useMemo } from "react";
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

type Variant = {
  id: string;
  channel: string;
  audience: string;
  tone: string;
  generated_text: string;
  sourceTitle: string;
};

export function ExportList({
  variants,
  className,
}: {
  variants: Variant[];
  className?: string;
}) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewVariant, setPreviewVariant] = useState<Variant | null>(null);
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [audienceFilter, setAudienceFilter] = useState<string>("all");
  const [toneFilter, setToneFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return variants.filter((v) => {
      if (channelFilter !== "all" && v.channel !== channelFilter) return false;
      if (audienceFilter !== "all" && v.audience !== audienceFilter) return false;
      if (toneFilter !== "all" && v.tone !== toneFilter) return false;
      if (search.trim() && !v.sourceTitle.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [variants, channelFilter, audienceFilter, toneFilter, search]);

  const copyOne = (v: Variant) => {
    void navigator.clipboard.writeText(v.generated_text);
    setCopiedId(v.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const copyAll = () => {
    const text = filtered.map((v) => `${v.sourceTitle} [${v.channel}/${v.audience}/${v.tone}]\n${v.generated_text}`).join("\n\n---\n\n");
    void navigator.clipboard.writeText(text);
    setCopiedId("all");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const downloadTxt = () => {
    const text = filtered.map((v) => `${v.sourceTitle} [${v.channel}/${v.audience}/${v.tone}]\n${v.generated_text}`).join("\n\n---\n\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "approved-variants.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadCsv = () => {
    const header = "Source,Channel,Audience,Tone,Text\n";
    const rows = filtered.map((v) => {
      const escaped = '"' + (v.generated_text ?? "").replace(/"/g, '""') + '"';
      return `"${v.sourceTitle}",${v.channel},${v.audience},${v.tone},${escaped}`;
    });
    const csv = header + rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "approved-variants.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (variants.length === 0) {
    return (
      <p className="text-muted-foreground">
        No approved variants yet. Approve some in Review.
      </p>
    );
  }

  return (
    <div className={className}>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          type="search"
          placeholder="Search source..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
        />
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
      <div className="flex gap-2 mb-4">
        <Button variant="outline" size="sm" onClick={copyAll} disabled={filtered.length === 0}>
          {copiedId === "all" ? "Copied!" : "Copy all"}
        </Button>
        <Button variant="outline" size="sm" onClick={downloadTxt} disabled={filtered.length === 0}>
          Download TXT
        </Button>
        <Button variant="outline" size="sm" onClick={downloadCsv} disabled={filtered.length === 0}>
          Download CSV
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Source</TableHead>
            <TableHead>Channel</TableHead>
            <TableHead>Audience</TableHead>
            <TableHead>Tone</TableHead>
            <TableHead>Preview</TableHead>
            <TableHead className="w-[100px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((v) => (
            <TableRow key={v.id}>
              <TableCell>{v.sourceTitle}</TableCell>
              <TableCell>{v.channel}</TableCell>
              <TableCell>{v.audience}</TableCell>
              <TableCell>{v.tone}</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreviewVariant(v)}
                >
                  Preview
                </Button>
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyOne(v)}
                >
                  {copiedId === v.id ? "Copied!" : "Copy"}
                </Button>
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
    </div>
  );
}
