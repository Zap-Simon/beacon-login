# @hubbardfam/beacon-login

Pre-styled, beacon-backed login system for Next.js applications. Ships a dark terminal-aesthetic login UI and server-side auth helpers that authenticate against the hubbardfam beacon hub.

## Features

- **`<BeaconLoginForm />`** — Styled password form (React 19 `useActionState`)
- **`<BeaconLoginPage />`** — Full-page centered login layout with customisable branding
- **`createBeaconAuthAction()`** — Server action factory that authenticates via beacon's `/auth/login`
- **`createBeaconMiddleware()`** — Edge-compatible middleware that verifies JWTs offline
- **Design tokens** — Dark-first CSS custom properties + Tailwind v4 `@theme` mapping
- **Centralised security** — Failed login events logged by the beacon automatically

## Installation

```bash
npm install @hubbardfam/beacon-login
```

Requires `.npmrc` in your project root:

```
@hubbardfam:registry=https://npm.pkg.github.com
```

## Quick Start

### 1. Environment Variables

```env
BEACON_API_URL=https://your-beacon-url.internal:3001
JWT_SECRET=your-shared-jwt-secret
```

### 2. Login Page

```tsx
// app/login/page.tsx
import { BeaconLoginPage } from "@hubbardfam/beacon-login";
import { loginAction } from "./actions";
import "@hubbardfam/beacon-login/styles.css";

export const metadata = { title: "Login" };

export default function LoginPage() {
  return (
    <BeaconLoginPage
      action={loginAction}
      title="My Application"
      subtitle="Enter password to continue"
      footer="powered by hubbardfam-beacon"
    />
  );
}
```

### 3. Server Actions

```tsx
// app/login/actions.ts
"use server";

import {
  createBeaconAuthAction,
  createLogoutAction,
} from "@hubbardfam/beacon-login/server";

export const loginAction = createBeaconAuthAction({
  beaconUrl: process.env.BEACON_API_URL!,
});

export const logoutAction = createLogoutAction();
```

### 4. Middleware

```tsx
// middleware.ts
import { createBeaconMiddleware } from "@hubbardfam/beacon-login/server";

export const middleware = createBeaconMiddleware({
  jwtSecret: process.env.JWT_SECRET!,
  publicPaths: ["/login", "/api/heartbeat"],
});

export const config = {
  matcher: [
    "/((?!_next|favicon\\.ico|icon|apple-icon|manifest).*)",
  ],
};
```

### 5. Fonts (optional but recommended)

```tsx
// app/layout.tsx
import { Geist_Mono } from "next/font/google";

const geistMono = Geist_Mono({
  variable: "--font-beacon-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={geistMono.variable}>{children}</body>
    </html>
  );
}
```

## API Reference

### Components

#### `<BeaconLoginForm />`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `action` | `LoginAction` | **required** | React 19 form action |
| `placeholder` | `string` | `"••••••••"` | Input placeholder |
| `submitLabel` | `string` | `"Enter"` | Button text |
| `loadingLabel` | `string` | `"Verifying…"` | Button text while loading |

#### `<BeaconLoginPage />`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `action` | `LoginAction` | **required** | React 19 form action |
| `title` | `string` | `"Dashboard"` | Heading text |
| `subtitle` | `string` | `"Enter password to continue"` | Subheading text |
| `footer` | `string` | `"hubbardfam-beacon"` | Footer text |
| `formProps` | `Omit<BeaconLoginFormProps, "action">` | — | Pass-through to form |

### Server Helpers

#### `createBeaconAuthAction(options)`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `beaconUrl` | `string` | **required** | Beacon hub URL |
| `loginPath` | `string` | `"/auth/login"` | Auth endpoint path |
| `username` | `string` | `"dashboard"` | Username sent to beacon |
| `cookieName` | `string` | `"beacon_session"` | JWT cookie name |
| `cookieMaxAge` | `number` | `604800` | Cookie lifetime (seconds) |
| `redirectTo` | `string` | `"/"` | Post-login redirect |
| `source` | `string` | — | Frontend identifier for audit trail |

#### `createBeaconMiddleware(options)`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `jwtSecret` | `string` | **required** | JWT signing secret |
| `cookieName` | `string` | `"beacon_session"` | Cookie name |
| `loginPath` | `string` | `"/login"` | Redirect target |
| `publicPaths` | `string[]` | `["/login"]` | Paths that skip auth |
| `disabled` | `boolean` | `false` | Disable the gate entirely |

#### `createLogoutAction(options?)`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `cookieName` | `string` | `"beacon_session"` | Cookie name |
| `redirectTo` | `string` | `"/login"` | Post-logout redirect |

### CSS Custom Properties

Import `@hubbardfam/beacon-login/styles.css` to activate:

| Variable | Value | Purpose |
|----------|-------|---------|
| `--beacon-background` | `#050505` | Page background |
| `--beacon-foreground` | `#ffffff` | Primary text |
| `--beacon-surface` | `#121212` | Card/panel background |
| `--beacon-surface-2` | `#1b1b1b` | Input/secondary surface |
| `--beacon-border` | `#444444` | Borders |
| `--beacon-muted` | `#9f9f9f` | Placeholder/dim text |
| `--beacon-muted-strong` | `#d4d4d4` | Labels/secondary text |
| `--beacon-accent` | `#ff8a2a` | Orange accent (buttons, focus) |
| `--beacon-danger` | `#ff7130` | Error messages |

Override any variable in your own CSS to customise the theme.

## Beacon Requirements

The beacon hub must:

1. Expose `POST /auth/login` accepting `{ username, password }` and returning `{ auth: { token, expiresIn } }`
2. Sign JWTs with HMAC-SHA256 using the same secret shared via `JWT_SECRET`
3. Include `exp` (Unix timestamp) in the JWT payload
4. Log failed login attempts as security events internally

## License

UNLICENSED — Private package for hubbardfam infrastructure.
