"use client";

import { useState } from "react";
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

  const copyOne = (v: Variant) => {
    void navigator.clipboard.writeText(v.generated_text);
    setCopiedId(v.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const copyAll = () => {
    const text = variants.map((v) => `${v.sourceTitle} [${v.channel}/${v.audience}/${v.tone}]\n${v.generated_text}`).join("\n\n---\n\n");
    void navigator.clipboard.writeText(text);
    setCopiedId("all");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const downloadTxt = () => {
    const text = variants.map((v) => `${v.sourceTitle} [${v.channel}/${v.audience}/${v.tone}]\n${v.generated_text}`).join("\n\n---\n\n");
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
    const rows = variants.map((v) => {
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
      <div className="flex gap-2 mb-4">
        <Button variant="outline" size="sm" onClick={copyAll}>
          {copiedId === "all" ? "Copied!" : "Copy all"}
        </Button>
        <Button variant="outline" size="sm" onClick={downloadTxt}>
          Download TXT
        </Button>
        <Button variant="outline" size="sm" onClick={downloadCsv}>
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
          {variants.map((v) => (
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
