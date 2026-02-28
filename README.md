# @zap-simon/beacon-login

Pre-styled login UI components for React / Next.js that work with the beacon auth system.

> **Frontend package** — for the Fastify auth backend, see [`@zap-simon/beacon-auth`](https://github.com/zap-simon/beacon-auth).

## Installation

```bash
npm install @zap-simon/beacon-login
```

## Features

- **`<BeaconLoginForm />`** — Styled password form (React 19 `useActionState` or fetch mode)
- **`<BeaconLoginPage />`** — Full-page centered login layout with customisable branding
- **Design tokens** — Dark-first CSS custom properties + Tailwind v4 `@theme` mapping
- **Two modes** — Works with Next.js server actions _or_ direct fetch to a backend API

## Quick Start

### Fetch Mode (microservices — recommended)

The form posts JSON to your auth microservice. The backend handles beacon communication and sets an HttpOnly cookie.

```tsx
"use client";

import { BeaconLoginPage } from "@zap-simon/beacon-login";
import "@zap-simon/beacon-login/styles.css";

export default function LoginPage() {
  return (
    <BeaconLoginPage
      loginUrl="https://your-auth-service.internal/auth/login"
      onSuccess={() => (window.location.href = "/")}
      text={{
        title: "My Application",
        subtitle: "Sign in to continue",
        footer: "internal auth",
      }}
    />
  );
}
```

### Server Action Mode (Next.js monolith)

If your Next.js app talks directly to the beacon (no separate auth service):

```tsx
import { BeaconLoginPage } from "@zap-simon/beacon-login";
import { loginAction } from "./actions";
import "@zap-simon/beacon-login/styles.css";

export default function LoginPage() {
  return <BeaconLoginPage action={loginAction} title="My Application" />;
}
```

### Styles

```tsx
import "@zap-simon/beacon-login/styles.css";
```

### Fonts (optional)

```tsx
import { Geist_Mono } from "next/font/google";

const geistMono = Geist_Mono({
  variable: "--font-beacon-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={geistMono.variable}>{children}</body>
    </html>
  );
}
```

## API

### `<BeaconLoginForm />`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `action` | `LoginAction` | — | React 19 server action (action mode) |
| `loginUrl` | `string` | — | Auth service URL (fetch mode) |
| `onSuccess` | `() => void` | — | Called after successful fetch login |
| `username` | `string` | `"dashboard"` | Username sent in fetch body |
| `placeholder` | `string` | `"••••••••"` | Input placeholder |
| `submitLabel` | `string` | `"Enter"` | Button text |
| `loadingLabel` | `string` | `"Verifying…"` | Button text while loading |

Provide either `action` (server action mode) or `loginUrl` (fetch mode) — not both.

### `<BeaconLoginPage />`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `action` / `loginUrl` | — | — | Same as form (determines mode) |
| `text` | `{ title?, subtitle?, footer? }` | — | Convenience object for login page copy |
| `title` | `string` | `"Dashboard"` | Heading text (legacy/direct prop) |
| `subtitle` | `string` | `"Enter password to continue"` | Subheading (legacy/direct prop) |
| `footer` | `string` | `"beacon"` | Footer text (legacy/direct prop) |
| `formProps` | `object` | — | Pass-through to the form |

`text` is the easiest way to customise all page copy in one place.  
If both are provided, `text` values take priority over `title` / `subtitle` / `footer`.

### CSS Custom Properties

| Variable | Value | Purpose |
|----------|-------|---------|
| `--beacon-background` | `#050505` | Page background |
| `--beacon-foreground` | `#ffffff` | Primary text |
| `--beacon-surface` | `#121212` | Card background |
| `--beacon-surface-2` | `#1b1b1b` | Input background |
| `--beacon-border` | `#444444` | Borders |
| `--beacon-muted` | `#9f9f9f` | Dim text |
| `--beacon-muted-strong` | `#d4d4d4` | Labels |
| `--beacon-accent` | `#ff8a2a` | Buttons, focus rings |
| `--beacon-danger` | `#ff7130` | Error messages |

Override any variable in your own CSS to customise.

## License

UNLICENSED — Private package for zap-simon infrastructure.