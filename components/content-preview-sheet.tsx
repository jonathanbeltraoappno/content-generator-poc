"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

type ContentPreviewSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  text: string;
  channel?: string;
  audience?: string;
  tone?: string;
  sourceTitle?: string;
};

export function ContentPreviewSheet({
  open,
  onOpenChange,
  text,
  channel,
  audience,
  tone,
  sourceTitle,
}: ContentPreviewSheetProps) {
  const meta = [channel, audience, tone].filter(Boolean).join(" · ");
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{sourceTitle ?? "Content Preview"}</SheetTitle>
          {meta && (
            <SheetDescription className="text-left">{meta}</SheetDescription>
          )}
        </SheetHeader>
        <div className="mt-6 pr-6">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed bg-muted/50 rounded-lg p-4 overflow-x-auto">
              {text || "No content."}
            </pre>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
