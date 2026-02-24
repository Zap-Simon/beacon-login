/* ── Beacon Auth Middleware Factory ───────────────────────────
 * Creates a Next.js middleware function that verifies the beacon
 * JWT cookie on every request. Runs in Edge Runtime — uses only
 * Web Crypto (no Node.js crypto module).
 *
 * Usage:
 *   // middleware.ts
 *   import { createBeaconMiddleware } from "@hubbardfam/beacon-login/server";
 *
 *   export const middleware = createBeaconMiddleware({
 *     jwtSecret: process.env.JWT_SECRET!,
 *     publicPaths: ["/login", "/api/heartbeat"],
 *   });
 *
 *   export const config = {
 *     matcher: ["/((?!_next|favicon\\.ico|icon|apple-icon|manifest).*)"],
 *   };
 * ───────────────────────────────────────────────────────────── */

import { log } from "./logger";

const mw = log("middleware");

/* ── Types ──────────────────────────────────────────────────── */

export interface BeaconMiddlewareOptions {
  /**
   * Shared secret the beacon uses to sign JWTs (HMAC-SHA256).
   * Must match the beacon's signing key exactly.
   */
  jwtSecret: string;

  /** Cookie name — must match the auth action. @default "beacon_session" */
  cookieName?: string;

  /** Path to redirect unauthenticated users to. @default "/login" */
  loginPath?: string;

  /**
   * Paths that skip authentication (always accessible).
   * Matched with startsWith() — e.g. "/login" matches "/login" and "/login?foo".
   * @default ["/login"]
   */
  publicPaths?: string[];

  /**
   * Disable the gate entirely (useful for local dev).
   * @default false
   */
  disabled?: boolean;
}

/* ── JWT helpers (Edge-compatible, Web Crypto only) ─────────── */

function base64UrlDecode(str: string): Uint8Array {
  // Restore standard base64
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  // Pad to multiple of 4
  while (base64.length % 4 !== 0) base64 += "=";

  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function hmacVerify(
  headerPayload: string,
  signatureBytes: Uint8Array,
  secret: string,
): Promise<boolean> {
  const enc = new TextEncoder();

  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const expected = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, enc.encode(headerPayload)),
  );

  // Constant-time comparison
  if (expected.length !== signatureBytes.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected[i] ^ signatureBytes[i];
  }
  return diff === 0;
}

interface JwtPayload {
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

/**
 * Verify a JWT's HMAC-SHA256 signature and check expiry.
 * Returns the decoded payload on success, null on failure.
 */
async function verifyJwt(
  token: string,
  secret: string,
): Promise<JwtPayload | null> {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [header, payload, signature] = parts;
  const headerPayload = `${header}.${payload}`;
  const signatureBytes = base64UrlDecode(signature);

  const valid = await hmacVerify(headerPayload, signatureBytes, secret);
  if (!valid) return null;

  try {
    const decoded: JwtPayload = JSON.parse(
      new TextDecoder().decode(base64UrlDecode(payload)),
    );

    // Check expiry if present
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
}

/* ── Middleware factory ──────────────────────────────────────── */

// We dynamically import next/server so the types work at build time
// without requiring next to be installed as a direct dependency.
type NextRequest = {
  nextUrl: { pathname: string };
  cookies: { get: (name: string) => { value: string } | undefined };
  url: string;
};

type NextResponseType = {
  next: () => unknown;
  redirect: (url: URL) => unknown;
};

/**
 * Creates a Next.js middleware function that protects routes with
 * beacon JWT authentication.
 */
export function createBeaconMiddleware(options: BeaconMiddlewareOptions) {
  const {
    jwtSecret,
    cookieName = "beacon_session",
    loginPath = "/login",
    publicPaths = ["/login"],
    disabled = false,
  } = options;

  return async function middleware(request: NextRequest) {
    // Dynamically import to avoid requiring next as a direct dep
    const { NextResponse } = await import("next/server") as { NextResponse: NextResponseType };

    // Gate disabled — pass everything through
    if (disabled) return NextResponse.next();

    const pathname = request.nextUrl.pathname;

    // Check public paths
    for (const pub of publicPaths) {
      if (pathname === pub || pathname.startsWith(pub + "/") || pathname.startsWith(pub + "?")) {
        return NextResponse.next();
      }
    }

    // Read JWT from cookie
    const token = request.cookies.get(cookieName)?.value;
    if (!token) {
      mw.info(`${pathname} → redirect ${loginPath} (no cookie)`);
      const loginUrl = new URL(loginPath, request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Verify JWT
    const payload = await verifyJwt(token, jwtSecret);
    if (!payload) {
      mw.info(`${pathname} → redirect ${loginPath} (invalid/expired JWT)`);
      const loginUrl = new URL(loginPath, request.url);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  };
}
