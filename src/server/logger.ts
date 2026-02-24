/* ── Logger ───────────────────────────────────────────────────
 * Tagged console logger for server-side helpers.
 * Output goes to stdout/stderr — Railway, Vercel, etc.
 * capture it automatically.
 * ───────────────────────────────────────────────────────────── */

export interface Logger {
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
}

export function log(tag: string): Logger {
  const prefix = `[beacon-login:${tag}]`;
  return {
    info: (...args: unknown[]) => console.log(prefix, ...args),
    warn: (...args: unknown[]) => console.warn(prefix, ...args),
    error: (...args: unknown[]) => console.error(prefix, ...args),
  };
}
