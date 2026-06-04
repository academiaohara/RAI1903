import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { syncUserProfile } from "@/lib/auth/sync-profile";
import { getSupabaseAnonKey, getSupabaseUrl, isSupabaseConfigured } from "@/lib/supabase/env";

function safeNextPath(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/";
  return next;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const origin = requestUrl.origin;
  const code = requestUrl.searchParams.get("code");
  const next = safeNextPath(requestUrl.searchParams.get("next"));

  const oauthError = requestUrl.searchParams.get("error");
  const oauthErrorDescription = requestUrl.searchParams.get("error_description");

  if (oauthError) {
    const params = new URLSearchParams({ error: "auth" });
    if (oauthErrorDescription) params.set("reason", oauthErrorDescription.slice(0, 200));
    return NextResponse.redirect(`${origin}/login?${params.toString()}`);
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(`${origin}/login?error=config`);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=no_code`);
  }

  let response = NextResponse.redirect(`${origin}${next}`);

  const supabase = createServerClient(getSupabaseUrl()!, getSupabaseAnonKey()!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.redirect(`${origin}${next}`);
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const params = new URLSearchParams({ error: "auth" });
    params.set("reason", error.message.slice(0, 200));
    return NextResponse.redirect(`${origin}/login?${params.toString()}`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    await syncUserProfile(supabase, user);
  }

  return response;
}
