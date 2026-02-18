import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

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
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  let user: { sub?: string } | null = null;
  const { data: claimsData } = await supabase.auth.getClaims();
  if (claimsData?.claims) {
    user = claimsData.claims;
  } else {
    const { data: userData } = await supabase.auth.getUser();
    if (userData?.user) user = { sub: userData.user.id };
  }

  const path = request.nextUrl.pathname;
  const protectedPaths = ["/library", "/generate", "/review", "/export"];
  const isProtected = protectedPaths.some((p) => path.startsWith(p));

  const redirectWithCookies = (url: URL) => {
    const res = NextResponse.redirect(url, 303);
    supabaseResponse.cookies.getAll().forEach(({ name, value }) =>
      res.cookies.set(name, value)
    );
    return res;
  };

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return redirectWithCookies(url);
  }

  if (path === "/login" && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/library";
    return redirectWithCookies(url);
  }

  return supabaseResponse;
}
