import { cache } from "react";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { fetchWithTimeout } from "./fetch";
import type { Database } from "@/types/supabase";

/**
 * One client per request. Server components, layouts and server actions in the
 * same request share it instead of building and authenticating again.
 */
export const createClient = cache(async () => {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        fetch: fetchWithTimeout,
      },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignore - cookies can only be modified in Server Actions or Route Handlers
          }
        },
      },
    }
  );
});

/**
 * The signed-in user, resolved at most once per request. `getUser()` is a
 * network call, so calling it from both a layout and a page would otherwise
 * cost two round trips.
 */
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
});

const PROJECT_REF = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname.split(".")[0];
  } catch {
    return "";
  }
})();

/**
 * Cheap "is there a session cookie?" check for chrome like the navbar.
 *
 * `getUser()` is a network round trip (~200ms, and up to the 8s timeout when
 * Supabase is slow). Calling it in the shared locale layout made every page -
 * including public ones - wait on an auth request before it could render.
 * Anything that actually needs a verified identity must still use
 * `getCurrentUser()`; this only decides whether to show a link.
 */
export async function hasAuthCookie(): Promise<boolean> {
  const store = await cookies();
  const prefix = PROJECT_REF ? `sb-${PROJECT_REF}` : "sb-";
  return store
    .getAll()
    .some(
      (c) =>
        Boolean(c.value) &&
        c.name.startsWith(prefix) &&
        (c.name.includes("auth-token") || c.name.includes("refresh-token"))
    );
}
