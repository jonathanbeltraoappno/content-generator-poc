import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  let signOutResponse = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: object }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          signOutResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            signOutResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );
  await supabase.auth.signOut();
  const redirectResponse = NextResponse.redirect(new URL("/login", request.url), 303);
  signOutResponse.cookies.getAll().forEach(({ name, value }) =>
    redirectResponse.cookies.set(name, value)
  );
  return redirectResponse;
}
