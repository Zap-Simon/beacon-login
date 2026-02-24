/* ── Auth Action Factory ──────────────────────────────────────
 * Creates a Next.js server action that authenticates against the
 * beacon's POST /auth/login endpoint. The beacon validates the
 * password and logs security events (failed attempts) internally.
 *
 * Usage:
 *   // app/login/actions.ts
 *   "use server";
 *   import { createBeaconAuthAction, createLogoutAction } from "@hubbardfam/beacon-login/server";
 *
 *   export const loginAction = createBeaconAuthAction({
 *     beaconUrl: process.env.BEACON_API_URL!,
 *   });
 *
 *   export const logoutAction = createLogoutAction();
 * ───────────────────────────────────────────────────────────── */

import { setJwtCookie, clearJwtCookie } from "./jwt-cookie";
import { log } from "./logger";

const l = log("auth");

/* ── Types ──────────────────────────────────────────────────── */

export interface BeaconAuthActionOptions {
  /** Full beacon hub URL (e.g. "https://beacon.internal:3001"). */
  beaconUrl: string;

  /** Beacon auth endpoint path. @default "/auth/login" */
  loginPath?: string;

  /** Username sent to the beacon. @default "dashboard" */
  username?: string;

  /** Cookie name for the JWT. @default "beacon_session" */
  cookieName?: string;

  /** Cookie max-age in seconds. @default 604800 (7 days) */
  cookieMaxAge?: number;

  /** Path to redirect to on successful login. @default "/" */
  redirectTo?: string;

  /**
   * Optional source identifier sent to the beacon so it knows
   * which frontend the login attempt came from.
   * @default undefined
   */
  source?: string;
}

export interface LogoutActionOptions {
  /** Cookie name — must match the auth action. @default "beacon_session" */
  cookieName?: string;

  /** Path to redirect to after logout. @default "/login" */
  redirectTo?: string;
}

export interface LoginActionState {
  error: string | null;
}

/* ── Beacon auth response shape ─────────────────────────────── */

interface BeaconAuthResponse {
  auth: {
    token: string;
    expiresIn: number;
  };
}

/* ── Factory: login action ──────────────────────────────────── */

/**
 * Creates a React 19 server-action–compatible async function
 * that authenticates against the beacon hub.
 *
 * The returned function:
 * 1. Reads "password" from FormData.
 * 2. POSTs to `${beaconUrl}${loginPath}` with `{ username, password }`.
 * 3. On 200 → stores JWT cookie, redirects to `redirectTo`.
 * 4. On 401 → returns `{ error: "Incorrect password." }`.
 * 5. On network error → returns `{ error: "Unable to reach …" }`.
 *
 * The beacon is responsible for logging failed attempts as
 * security events — this function does NOT report them.
 */
export function createBeaconAuthAction(options: BeaconAuthActionOptions) {
  const {
    beaconUrl,
    loginPath = "/auth/login",
    username = "dashboard",
    cookieName,
    cookieMaxAge,
    redirectTo = "/",
    source,
  } = options;

  const url = `${beaconUrl.replace(/\/+$/, "")}${loginPath}`;

  return async function loginAction(
    _prev: LoginActionState,
    formData: FormData,
  ): Promise<LoginActionState> {
    const password = formData.get("password");

    if (typeof password !== "string" || password.length === 0) {
      return { error: "Password is required." };
    }

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          ...(source ? { source } : {}),
        }),
      });

      if (res.status === 401 || res.status === 403) {
        l.warn("beacon returned 401 — incorrect password");
        return { error: "Incorrect password." };
      }

      if (!res.ok) {
        l.error(`beacon returned ${res.status}`);
        return { error: "Authentication service error. Try again." };
      }

      const data: BeaconAuthResponse = await res.json();
      const { token, expiresIn } = data.auth;

      await setJwtCookie(token, expiresIn, { cookieName, maxAge: cookieMaxAge });

      l.info("login OK — cookie set, redirecting");
    } catch (err) {
      l.error("beacon unreachable:", err);
      return { error: "Unable to reach authentication server." };
    }

    // redirect() must be called outside the try/catch because
    // Next.js throws a NEXT_REDIRECT "error" internally.
    // It never actually returns — Next.js intercepts the throw.
    const { redirect } = await import("next/navigation");
    return redirect(redirectTo) as never;
  };
}

/* ── Factory: logout action ─────────────────────────────────── */

/**
 * Creates a server action that clears the JWT cookie and redirects.
 */
export function createLogoutAction(options?: LogoutActionOptions) {
  const { cookieName, redirectTo = "/login" } = options ?? {};

  return async function logoutAction(): Promise<void> {
    await clearJwtCookie(cookieName);
    const { redirect } = await import("next/navigation");
    redirect(redirectTo);
  };
}
