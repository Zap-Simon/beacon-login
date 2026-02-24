/* ── @hubbardfam/beacon-login ─────────────────────────────────
 * Public exports — client-side components.
 *
 * For server helpers, import from "@hubbardfam/beacon-login/server".
 * For styles, import "@hubbardfam/beacon-login/styles.css".
 * ───────────────────────────────────────────────────────────── */

export { BeaconLoginForm } from "./components/BeaconLoginForm";
export type {
  BeaconLoginFormProps,
  LoginAction,
  LoginActionState,
} from "./components/BeaconLoginForm";

export { BeaconLoginPage } from "./components/BeaconLoginPage";
export type { BeaconLoginPageProps } from "./components/BeaconLoginPage";
