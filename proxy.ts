import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SUPPORTED_LOCALES = ["ar", "en", "ru"] as const;
const DEFAULT_LOCALE = "ar";
const PROJECT_REF = "aezhalzpeitbnxjqcylb";

function getLocaleFromPath(pathname: string): string | null {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length > 0 && SUPPORTED_LOCALES.includes(segments[0] as any)) {
    return segments[0];
  }
  return null;
}

function getLocaleFromCookies(request: NextRequest): string | null {
  const locale = request.cookies.get("NEXT_LOCALE")?.value;
  if (locale && SUPPORTED_LOCALES.includes(locale as any)) {
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
      .find((l) => SUPPORTED_LOCALES.includes(l as any));
    if (preferred) return preferred;
  }

  return DEFAULT_LOCALE;
}

function isAuthenticated(request: NextRequest): boolean {
  const authCookieName = `sb-${PROJECT_REF}-auth-token`;
  const cookie = request.cookies.get(authCookieName);
  if (cookie?.value) return true;

  const allCookies = request.cookies.getAll();
  return allCookies.some(
    (c) =>
      c.name.startsWith(`sb-${PROJECT_REF}`) &&
      (c.name.includes("auth-token") || c.name.includes("refresh-token"))
  );
}

export function proxy(request: NextRequest): NextResponse {
  const { pathname, search } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/images") ||
    pathname === "/manifest.json" ||
    pathname === "/robots.txt" ||
    /\.(png|jpg|jpeg|gif|webp|svg|ico|css|js|json|xml|woff2?)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  const pathLocale = getLocaleFromPath(pathname);

  if (!pathLocale) {
    const locale = getPreferredLocale(request);
    const url = new URL(`/${locale}${pathname === "/" ? "" : pathname}${search}`, request.url);
    return NextResponse.redirect(url);
  }

  if (
    pathname.startsWith(`/${pathLocale}/dashboard`) ||
    pathname === `/${pathLocale}/dashboard`
  ) {
    if (!isAuthenticated(request)) {
      const loginUrl = new URL(`/${pathLocale}/login${search}`, request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|api|favicon|images|static).*)"],
};
