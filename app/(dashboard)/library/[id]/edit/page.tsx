import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateContentAction } from "@/app/(dashboard)/library/actions";

export default async function EditContentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error: errorMessage } = await searchParams;
  const supabase = await createClient();
  const { data: row } = await supabase
    .from("approved_content")
    .select("id, title, body, brand, campaign")
    .eq("id", id)
    .single();

  if (!row) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">Edit content</h1>
      <Card className="mt-6 max-w-2xl">
        <CardHeader>
          <CardTitle>Edit approved content</CardTitle>
          <CardDescription>Update title, body, and optional metadata.</CardDescription>
        </CardHeader>
        <CardContent>
          {errorMessage && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive mb-4">
              {errorMessage}
            </div>
          )}
          <form action={updateContentAction} className="space-y-4">
            <input type="hidden" name="contentId" value={id} />
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                defaultValue={row.title}
                required
                placeholder="e.g. Q1 campaign headline"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="body">Body</Label>
              <Textarea
                id="body"
                name="body"
                defaultValue={row.body}
                required
                rows={6}
                placeholder="Paste or type the approved copy..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brand">Brand (optional)</Label>
                <Input
                  id="brand"
                  name="brand"
                  defaultValue={row.brand ?? ""}
                  placeholder="Brand name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="campaign">Campaign (optional)</Label>
                <Input
                  id="campaign"
                  name="campaign"
                  defaultValue={row.campaign ?? ""}
                  placeholder="Campaign name"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit">Save</Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/library">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
