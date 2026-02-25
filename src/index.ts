/* ── @zap-simon/beacon-login ──────────────────────────────────
 * Public exports — client-side login components.
 *
 * For styles, import "@zap-simon/beacon-login/styles.css".
 * For backend auth, use "@zap-simon/beacon-auth" in your
 * Fastify microservice.
 * ───────────────────────────────────────────────────────────── */

export { BeaconLoginForm } from "./components/BeaconLoginForm";
export type {
  BeaconLoginFormProps,
  BeaconLoginFormActionProps,
  BeaconLoginFormFetchProps,
  BeaconLoginFormBaseProps,
  LoginAction,
  LoginActionState,
} from "./components/BeaconLoginForm";

export { BeaconLoginPage } from "./components/BeaconLoginPage";
export type {
  BeaconLoginPageProps,
  BeaconLoginPageActionProps,
  BeaconLoginPageFetchProps,
  BeaconLoginPageBaseProps,
} from "./components/BeaconLoginPage";
