/* ── BeaconLoginForm ──────────────────────────────────────────
 * Pre-styled password login form with the hubbardfam dark
 * terminal aesthetic. Uses React 19 useActionState + useFormStatus.
 *
 * Usage:
 *   import { BeaconLoginForm } from "@hubbardfam/beacon-login";
 *   <BeaconLoginForm action={myServerAction} />
 * ───────────────────────────────────────────────────────────── */

"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";

/* ── Types ──────────────────────────────────────────────────── */

/** Shape returned by the server action. */
export interface LoginActionState {
  error: string | null;
}

/** Server action signature compatible with React 19 useActionState. */
export type LoginAction = (
  prev: LoginActionState,
  formData: FormData,
) => Promise<LoginActionState>;

export interface BeaconLoginFormProps {
  /** React 19 form action — typically created by createBeaconAuthAction(). */
  action: LoginAction;

  /** Placeholder text for the password input. @default "••••••••" */
  placeholder?: string;

  /** Submit button label. @default "Enter" */
  submitLabel?: string;

  /** Loading-state button label. @default "Verifying…" */
  loadingLabel?: string;
}

/* ── Internal submit button ─────────────────────────────────── */

function SubmitButton({
  label = "Enter",
  loadingLabel = "Verifying…",
}: {
  label?: string;
  loadingLabel?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded border border-beacon-accent bg-beacon-accent px-3 py-2 font-beacon-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-beacon-background transition-colors hover:bg-beacon-accent/90 disabled:opacity-50"
    >
      {pending ? loadingLabel : label}
    </button>
  );
}

/* ── Main component ─────────────────────────────────────────── */

export function BeaconLoginForm({
  action,
  placeholder = "••••••••",
  submitLabel = "Enter",
  loadingLabel = "Verifying…",
}: BeaconLoginFormProps) {
  const [state, formAction] = useActionState(action, { error: null });
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Skip autofocus on mobile to avoid keyboard pop-up
    if (window.matchMedia("(min-width: 768px)").matches) {
      inputRef.current?.focus();
    }
  }, []);

  return (
    <form action={formAction} className="space-y-4">
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

      {state.error && (
        <p className="rounded border border-beacon-danger/30 bg-beacon-danger/10 px-3 py-2 font-beacon-mono text-[11px] text-beacon-danger">
          {state.error}
        </p>
      )}

      <SubmitButton label={submitLabel} loadingLabel={loadingLabel} />
    </form>
  );
}
