/* ── @hubbardfam/beacon-login/server ──────────────────────────
 * Server-side exports — auth action, middleware, JWT cookies.
 *
 * These use next/headers and next/navigation — never import
 * from client components.
 * ───────────────────────────────────────────────────────────── */

export {
  createBeaconAuthAction,
  createLogoutAction,
} from "./auth-action";
export type {
  BeaconAuthActionOptions,
  LogoutActionOptions,
  LoginActionState,
} from "./auth-action";

export {
  createBeaconMiddleware,
} from "./middleware";
export type {
  BeaconMiddlewareOptions,
} from "./middleware";

export {
  setJwtCookie,
  getJwtCookie,
  clearJwtCookie,
} from "./jwt-cookie";
export type {
  JwtCookieOptions,
} from "./jwt-cookie";

export { log } from "./logger";
export type { Logger } from "./logger";
