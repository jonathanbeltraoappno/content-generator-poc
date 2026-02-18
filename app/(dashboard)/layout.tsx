import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background">
        <div className="container flex h-14 items-center justify-between">
          <nav className="flex items-center gap-4">
            <Link href="/library" className="font-medium">
              Library
            </Link>
            <Link href="/generate" className="text-muted-foreground hover:text-foreground">
              Generate
            </Link>
            <Link href="/review" className="text-muted-foreground hover:text-foreground">
              Review
            </Link>
            <Link href="/export" className="text-muted-foreground hover:text-foreground">
              Export
            </Link>
          </nav>
          <form action="/api/auth/logout" method="post">
            <Button type="submit" variant="ghost" size="sm">
              Sign out
            </Button>
          </form>
        </div>
      </header>
      <main className="flex-1 container py-6">{children}</main>
    </div>
  );
}
