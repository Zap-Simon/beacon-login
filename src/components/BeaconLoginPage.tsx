/* ── BeaconLoginPage ──────────────────────────────────────────
 * Full-page centered login layout wrapping BeaconLoginForm.
 * Provides the branded card + title/subtitle/footer pattern
 * from the hubbardfam dashboard.
 *
 * Usage:
 *   import { BeaconLoginPage } from "@hubbardfam/beacon-login";
 *   <BeaconLoginPage action={myServerAction} title="My App" />
 * ───────────────────────────────────────────────────────────── */

"use client";

import {
  BeaconLoginForm,
  type BeaconLoginFormProps,
  type LoginAction,
} from "./BeaconLoginForm";

export interface BeaconLoginPageProps {
  /** React 19 form action. */
  action: LoginAction;

  /** Main heading above the login card. @default "Dashboard" */
  title?: string;

  /** Subtitle below the heading. @default "Enter password to continue" */
  subtitle?: string;

  /** Small footer text below the card. @default "hubbardfam-beacon" */
  footer?: string;

  /** Pass-through props to BeaconLoginForm (placeholder, labels). */
  formProps?: Omit<BeaconLoginFormProps, "action">;
}

export function BeaconLoginPage({
  action,
  title = "Dashboard",
  subtitle = "Enter password to continue",
  footer = "hubbardfam-beacon",
  formProps,
}: BeaconLoginPageProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-beacon-background px-4">
      <div className="w-full max-w-sm space-y-6">
        {/* ── Branding ─────────────────────────────────── */}
        <div className="text-center">
          <h1 className="font-beacon-mono text-sm font-bold uppercase tracking-[0.14em] text-beacon-foreground sm:text-lg">
            {title}
          </h1>
          <p className="mt-1 font-beacon-mono text-[10px] uppercase tracking-[0.12em] text-beacon-muted-strong sm:text-xs">
            {subtitle}
          </p>
        </div>

        {/* ── Login card ───────────────────────────────── */}
        <div className="beacon-panel space-y-4">
          <BeaconLoginForm action={action} {...formProps} />
        </div>

        {/* ── Footer ───────────────────────────────────── */}
        {footer && (
          <p className="text-center font-beacon-mono text-[9px] uppercase tracking-[0.12em] text-beacon-muted">
            {footer}
          </p>
        )}
      </div>
    </div>
  );
}
