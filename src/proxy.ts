import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const SUPPORTED_LOCALES = ["ar", "en", "ru"] as const;
const DEFAULT_LOCALE = "ar";

type Locale = (typeof SUPPORTED_LOCALES)[number];

function isLocale(value: string | undefined): value is Locale {
  return SUPPORTED_LOCALES.some((locale) => locale === value);
}

function getSupabaseProjectRef(): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return "";
  try {
    return new URL(supabaseUrl).hostname.split(".")[0];
  } catch {
    return "";
  }
}

const PROJECT_REF = getSupabaseProjectRef();

function getLocaleFromPath(pathname: string): string | null {
  const segments = pathname.split("/").filter(Boolean);
  if (isLocale(segments[0])) {
    return segments[0];
  }
  return null;
}

function getLocaleFromCookies(request: NextRequest): string | null {
  const locale = request.cookies.get("NEXT_LOCALE")?.value;
  if (isLocale(locale)) {
    return locale;
  }
  return null;
}

function getPreferredLocale(request: NextRequest): string {
  const cookieLocale = getLocaleFromCookies(request);
  if (cookieLocale) return cookieLocale;

  const acceptLanguage = request.headers.get("accept-language");
  if (acceptLanguage) {
    const preferred = acceptLanguage
      .split(",")
      .map((l) => l.split(";")[0].trim().split("-")[0])
      .find(isLocale);
    if (preferred) return preferred;
  }

  return DEFAULT_LOCALE;
}

function isAuthenticated(request: NextRequest): boolean {
  const cookiePrefix = PROJECT_REF ? `sb-${PROJECT_REF}` : "sb-";
  return request.cookies.getAll().some(
    (c) =>
      Boolean(c.value) &&
      c.name.startsWith(cookiePrefix) &&
      (c.name.includes("auth-token") || c.name.includes("refresh-token"))
  );
}

const SKIP_PREFIXES = ["/_next", "/api", "/static", "/favicon", "/images"] as const;

function isAssetRequest(pathname: string): boolean {
  return (
    SKIP_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
    pathname === "/manifest.json" ||
    pathname === "/robots.txt" ||
    /\.(png|jpg|jpeg|gif|webp|svg|ico|css|js|json|xml|woff2?)$/.test(pathname)
  );
}

/** Where this request should be sent instead, if anywhere. */
function redirectTarget(request: NextRequest): URL | null {
  const { pathname, search } = request.nextUrl;
  const pathLocale = getLocaleFromPath(pathname);

  if (!pathLocale) {
    const locale = getPreferredLocale(request);
    return new URL(`/${locale}${pathname === "/" ? "" : pathname}${search}`, request.url);
  }

  if (pathname === `/${pathLocale}/login` && isAuthenticated(request)) {
    return new URL(`/${pathLocale}`, request.url);
  }

  const dashboard = `/${pathLocale}/dashboard`;
  if ((pathname === dashboard || pathname.startsWith(`${dashboard}/`)) && !isAuthenticated(request)) {
    return new URL(`/${pathLocale}/login${search}`, request.url);
  }

  return null;
}

const fetchWithTimeout: typeof fetch = (input, init) => {
  if (init?.signal) return fetch(input, init);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);
  return fetch(input, { ...init, signal: controller.signal }).finally(() =>
    clearTimeout(timeout)
  );
};

/**
 * Refresh the session once per navigation, before anything renders.
 *
 * Refresh tokens are single-use: when parallel requests (a page, its
 * prefetches, a server action) all render with the same expired cookie, each
 * tries to refresh, the first rotates the token and the rest fail or wait out
 * the 8s fetch timeout. That is what made navigation stall for seconds and
 * sometimes signed the user out. `getSession()` only makes a network call when
 * the access token is within five minutes of expiring (`EXPIRY_MARGIN_MS`), so
 * the usual request stays a cheap cookie read.
 */
async function refreshSession(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return response;

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    global: { fetch: fetchWithTimeout },
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        // Send the renewed cookies to this render and to the browser.
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  try {
    await supabase.auth.getSession();
  } catch {
    // A failed refresh must not fail the navigation: pages and server actions
    // verify the user themselves.
  }

  return response;
}

export async function proxy(request: NextRequest) {
  if (isAssetRequest(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const response = await refreshSession(request);

  // Decide after the refresh so the guards see the current cookies.
  const target = redirectTarget(request);
  if (!target) return response;

  const redirect = NextResponse.redirect(target);
  response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|api|robots.txt|favicon|images|static).*)"],
};
