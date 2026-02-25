/* ── BeaconLoginForm ──────────────────────────────────────────
 * Pre-styled password login form with the beacon dark terminal
 * aesthetic. Supports two modes:
 *
 * 1. **Server-action mode** (Next.js) — pass `action` prop.
 * 2. **Fetch mode** (any React app) — pass `loginUrl` prop and
 *    the form POSTs JSON to your auth microservice.
 *
 * Usage:
 *   import { BeaconLoginForm } from "@zap-simon/beacon-login";
 *
 *   // Next.js server action
 *   <BeaconLoginForm action={myServerAction} />
 *
 *   // Fetch to auth microservice
 *   <BeaconLoginForm loginUrl="https://auth.example.com/auth/login" />
 * ───────────────────────────────────────────────────────────── */

"use client";

import { useActionState, useEffect, useRef, useState, useCallback } from "react";
import { useFormStatus } from "react-dom";

/* ── Types ──────────────────────────────────────────────────── */

/** Shape returned by a server action or internal fetch handler. */
export interface LoginActionState {
  error: string | null;
}

/** Server action signature compatible with React 19 useActionState. */
export type LoginAction = (
  prev: LoginActionState,
  formData: FormData,
) => Promise<LoginActionState>;

export interface BeaconLoginFormBaseProps {
  /** Placeholder text for the password input. @default "••••••••" */
  placeholder?: string;

  /** Submit button label. @default "Enter" */
  submitLabel?: string;

  /** Loading-state button label. @default "Verifying…" */
  loadingLabel?: string;
}

export interface BeaconLoginFormActionProps extends BeaconLoginFormBaseProps {
  /** React 19 form action — for Next.js server action mode. */
  action: LoginAction;
  loginUrl?: never;
  onSuccess?: never;
  username?: never;
}

export interface BeaconLoginFormFetchProps extends BeaconLoginFormBaseProps {
  /** URL of your auth microservice login endpoint (e.g. POST /auth/login). */
  loginUrl: string;

  /** Called after a successful login (e.g. to redirect or update state). */
  onSuccess?: () => void;

  /** Username to send in the login request body. @default "dashboard" */
  username?: string;

  action?: never;
}

export type BeaconLoginFormProps =
  | BeaconLoginFormActionProps
  | BeaconLoginFormFetchProps;

/* ── Internal submit button ─────────────────────────────────── */

function SubmitButton({
  label = "Enter",
  loadingLabel = "Verifying…",
  pending = false,
}: {
  label?: string;
  loadingLabel?: string;
  pending?: boolean;
}) {
  // useFormStatus only works inside a <form> with an action= prop.
  // In fetch mode, we pass `pending` directly.
  let isPending = pending;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const status = useFormStatus();
    isPending = isPending || status.pending;
  } catch {
    // useFormStatus throws outside a server-action form — ignore
  }

  return (
    <button
      type="submit"
      disabled={isPending}
      className="w-full rounded border border-beacon-accent bg-beacon-accent px-3 py-2 font-beacon-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-beacon-background transition-colors hover:bg-beacon-accent/90 disabled:opacity-50"
    >
      {isPending ? loadingLabel : label}
    </button>
  );
}

/* ── Error banner ───────────────────────────────────────────── */

function ErrorBanner({ message }: { message: string }) {
  return (
    <p className="rounded border border-beacon-danger/30 bg-beacon-danger/10 px-3 py-2 font-beacon-mono text-[11px] text-beacon-danger">
      {message}
    </p>
  );
}

/* ── Password input ─────────────────────────────────────────── */

function PasswordInput({
  inputRef,
  placeholder,
}: {
  inputRef: React.RefObject<HTMLInputElement | null>;
  placeholder: string;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor="beacon-password"
        className="font-beacon-mono text-[11px] uppercase tracking-[0.12em] text-beacon-muted-strong"
      >
        Password
      </label>
      <input
        ref={inputRef}
        id="beacon-password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        className="w-full rounded border border-beacon-border bg-beacon-surface-2 px-3 py-2 font-beacon-mono text-base sm:text-sm text-beacon-foreground placeholder:text-beacon-muted focus:border-beacon-accent focus:outline-none focus:ring-1 focus:ring-beacon-accent"
        placeholder={placeholder}
      />
    </div>
  );
}

/* ── Autofocus helper ───────────────────────────────────────── */

function useDesktopAutofocus(ref: React.RefObject<HTMLInputElement | null>) {
  useEffect(() => {
    if (window.matchMedia("(min-width: 768px)").matches) {
      ref.current?.focus();
    }
  }, [ref]);
}

/* ── Server-action form ─────────────────────────────────────── */

function ActionForm({
  action,
  placeholder = "••••••••",
  submitLabel,
  loadingLabel,
}: BeaconLoginFormActionProps) {
  const [state, formAction] = useActionState(action, { error: null });
  const inputRef = useRef<HTMLInputElement>(null);
  useDesktopAutofocus(inputRef);

  return (
    <form action={formAction} className="space-y-4">
      <PasswordInput inputRef={inputRef} placeholder={placeholder} />
      {state.error && <ErrorBanner message={state.error} />}
      <SubmitButton label={submitLabel} loadingLabel={loadingLabel} />
    </form>
  );
}

/* ── Fetch-based form ───────────────────────────────────────── */

function FetchForm({
  loginUrl,
  onSuccess,
  username = "dashboard",
  placeholder = "••••••••",
  submitLabel,
  loadingLabel,
}: BeaconLoginFormFetchProps) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  useDesktopAutofocus(inputRef);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError(null);
      setPending(true);

      const formData = new FormData(e.currentTarget);
      const password = formData.get("password");

      if (typeof password !== "string" || password.length === 0) {
        setError("Password is required.");
        setPending(false);
        return;
      }

      try {
        const res = await fetch(loginUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ username, password }),
        });

        if (res.status === 401 || res.status === 403) {
          setError("Incorrect password.");
          setPending(false);
          return;
        }

        if (!res.ok) {
          setError("Authentication service error. Try again.");
          setPending(false);
          return;
        }

        // Success — the auth service should have set an HttpOnly cookie.
        onSuccess?.();
      } catch {
        setError("Unable to reach authentication server.");
      } finally {
        setPending(false);
      }
    },
    [loginUrl, username, onSuccess],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PasswordInput inputRef={inputRef} placeholder={placeholder} />
      {error && <ErrorBanner message={error} />}
      <SubmitButton label={submitLabel} loadingLabel={loadingLabel} pending={pending} />
    </form>
  );
}

/* ── Main component ─────────────────────────────────────────── */

export function BeaconLoginForm(props: BeaconLoginFormProps) {
  if ("action" in props && props.action) {
    return <ActionForm {...props} />;
  }
  return <FetchForm {...(props as BeaconLoginFormFetchProps)} />;
}
