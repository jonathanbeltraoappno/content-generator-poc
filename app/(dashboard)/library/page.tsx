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

export default async function LibraryPage() {
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("approved_content")
    .select("id, title, body, brand, campaign, created_at")
    .order("updated_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Approved Content Library</h1>
        <Button asChild>
          <Link href="/library/new">Add content</Link>
        </Button>
      </div>
      {!items?.length ? (
        <p className="text-muted-foreground mt-4">No approved content yet. Add your first piece.</p>
      ) : (
        <Table className="mt-6">
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Campaign</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <Link
                    href={`/library/${row.id}/edit`}
                    className="font-medium text-primary hover:underline"
                  >
                    {row.title}
                  </Link>
                </TableCell>
                <TableCell>{row.brand ?? "—"}</TableCell>
                <TableCell>{row.campaign ?? "—"}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/library/${row.id}/edit`}>Edit</Link>
                  </Button>
                  <DeleteButton contentId={row.id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

function DeleteButton({ contentId }: { contentId: string }) {
  return (
    <form action={`/api/library/${contentId}/delete`} method="post" className="inline-block ml-2">
      <Button type="submit" variant="destructive" size="sm">
        Delete
      </Button>
    </form>
  );
}
