# Web App

This is an optional separate web application for:

- Marketing website
- Admin dashboard
- Public-facing features that don't need mobile capabilities

## Difference from `/app`

- **`/app`**: Mobile-first app with Capacitor (iOS/Android + Web PWA)
- **`/web`**: Pure web app without Capacitor dependencies

## When to use this

Use this directory if you need:

- A marketing/landing page separate from the mobile app
- An admin dashboard
- A web-only experience with different UI/UX from the mobile app

If you only need a single web experience that also works on mobile, just use `/app` and skip this directory.

## Getting Started

```bash
cd web
npm install
npm run dev
```

Visit http://localhost:5173
