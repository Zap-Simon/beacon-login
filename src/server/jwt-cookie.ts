/* ── JWT Cookie Helpers ───────────────────────────────────────
 * HttpOnly cookie utilities for storing the beacon JWT.
 * Uses next/headers cookies() — server-side only.
 * ───────────────────────────────────────────────────────────── */

import { cookies } from "next/headers";

const DEFAULT_COOKIE_NAME = "beacon_session";
const DEFAULT_MAX_AGE_S = 60 * 60 * 24 * 7; // 7 days

export interface JwtCookieOptions {
  /** Cookie name. @default "beacon_session" */
  cookieName?: string;
  /** Max-age in seconds. @default 604800 (7 days) */
  maxAge?: number;
}

/**
 * Store a JWT in an HttpOnly cookie.
 *
 * @param token    - The JWT string from the beacon's /auth/login response.
 * @param expiresIn - Token lifetime in seconds (from beacon response).
 *                    Used as cookie maxAge if less than the configured maxAge.
 * @param options  - Cookie name and max-age overrides.
 */
export async function setJwtCookie(
  token: string,
  expiresIn: number,
  options?: JwtCookieOptions,
): Promise<void> {
  const name = options?.cookieName ?? DEFAULT_COOKIE_NAME;
  const configMaxAge = options?.maxAge ?? DEFAULT_MAX_AGE_S;
  // Use the shorter of the two so the cookie doesn't outlive the token
  const maxAge = Math.min(configMaxAge, expiresIn);

  const jar = await cookies();
  jar.set(name, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  });
}

/**
 * Read the JWT from the cookie. Returns null if absent.
 */
export async function getJwtCookie(
  cookieName?: string,
): Promise<string | null> {
  const name = cookieName ?? DEFAULT_COOKIE_NAME;
  const jar = await cookies();
  return jar.get(name)?.value ?? null;
}

/**
 * Delete the JWT cookie (logout).
 */
export async function clearJwtCookie(
  cookieName?: string,
): Promise<void> {
  const name = cookieName ?? DEFAULT_COOKIE_NAME;
  const jar = await cookies();
  jar.delete(name);
}
