/* ── BeaconLoginPage ──────────────────────────────────────────
 * Full-page centered login layout wrapping BeaconLoginForm.
 * Provides the branded card + title/subtitle/footer pattern.
 *
 * Usage:
 *   import { BeaconLoginPage } from "@zap-simon/beacon-login";
 *
 *   // Next.js server action mode
 *   <BeaconLoginPage action={myServerAction} title="My App" />
 *
 *   // Fetch mode (microservices)
 *   <BeaconLoginPage
 *     loginUrl="https://auth.example.com/auth/login"
 *     onSuccess={() => window.location.href = "/"}
 *     title="My App"
 *   />
 * ───────────────────────────────────────────────────────────── */

"use client";

import {
  BeaconLoginForm,
  type BeaconLoginFormProps,
  type LoginAction,
} from "./BeaconLoginForm";

export interface BeaconLoginPageText {
  /** Main heading above the login card. */
  title?: string;

  /** Subtitle below the heading. */
  subtitle?: string;

  /** Small footer text below the card. */
  footer?: string;
}

export interface BeaconLoginPageBaseProps {
  /** Main heading above the login card. @default "Dashboard" */
  title?: string;

  /** Subtitle below the heading. @default "Enter password to continue" */
  subtitle?: string;

  /** Small footer text below the card. @default "beacon" */
  footer?: string;

  /**
   * Convenience text object for branding copy.
   * Useful when changing all login page text in one place.
   */
  text?: BeaconLoginPageText;
}

export interface BeaconLoginPageActionProps extends BeaconLoginPageBaseProps {
  /** React 19 form action — for Next.js server action mode. */
  action: LoginAction;

  /** Pass-through props to BeaconLoginForm (placeholder, labels). */
  formProps?: Omit<BeaconLoginFormProps, "action" | "loginUrl">;

  loginUrl?: never;
  onSuccess?: never;
  username?: never;
}

export interface BeaconLoginPageFetchProps extends BeaconLoginPageBaseProps {
  /** URL of your auth microservice login endpoint. */
  loginUrl: string;

  /** Called after successful login (e.g. redirect). */
  onSuccess?: () => void;

  /** Username sent in the login body. @default "dashboard" */
  username?: string;

  /** Pass-through props to BeaconLoginForm (placeholder, labels). */
  formProps?: Omit<BeaconLoginFormProps, "action" | "loginUrl" | "onSuccess" | "username">;

  action?: never;
}

export type BeaconLoginPageProps =
  | BeaconLoginPageActionProps
  | BeaconLoginPageFetchProps;

export function BeaconLoginPage(props: BeaconLoginPageProps) {
  const title = props.text?.title ?? props.title ?? "Dashboard";
  const subtitle =
    props.text?.subtitle ?? props.subtitle ?? "Enter password to continue";
  const footer = props.text?.footer ?? props.footer ?? "beacon";
  const { formProps } = props;

  // Build the correct form props based on mode
  const loginFormProps: BeaconLoginFormProps =
    "action" in props && props.action
      ? ({ action: props.action, ...formProps } as BeaconLoginFormProps)
      : ({
          loginUrl: (props as BeaconLoginPageFetchProps).loginUrl,
          onSuccess: (props as BeaconLoginPageFetchProps).onSuccess,
          username: (props as BeaconLoginPageFetchProps).username,
          ...formProps,
        } as BeaconLoginFormProps);

  return (
    <div className="flex min-h-screen items-center justify-center bg-beacon-background px-4">
      <div className="w-full max-w-sm">
        {/* ── Branding ─────────────────────────────────── */}
        <div className="mb-6 text-center">
          <h1 className="font-beacon-mono text-sm font-bold uppercase tracking-[0.14em] text-beacon-foreground sm:text-lg">
            {title}
          </h1>
          <p className="mt-1 font-beacon-mono text-[10px] uppercase tracking-[0.12em] text-beacon-muted-strong sm:text-xs">
            {subtitle}
          </p>
        </div>

        {/* ── Login card ───────────────────────────────── */}
        <div className="beacon-panel space-y-4">
          <BeaconLoginForm {...loginFormProps} />
        </div>

        {/* ── Footer ───────────────────────────────────── */}
        {footer && (
          <p className="mt-6 text-center font-beacon-mono text-[9px] uppercase tracking-[0.12em] text-beacon-muted">
            {footer}
          </p>
        )}
      </div>
    </div>
  );
}
