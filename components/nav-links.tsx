"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/library", label: "Library" },
  { href: "/generate", label: "Generate" },
  { href: "/review", label: "Review" },
  { href: "/export", label: "Export" },
] as const;

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-4">
      {links.map(({ href, label }) => {
        const isActive = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={
              isActive
                ? "font-medium text-foreground"
                : "text-muted-foreground hover:text-foreground transition-colors"
            }
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
