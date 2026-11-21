# EduROI — Education ROI Calculator (Frontend)

A React + TypeScript + Vite frontend for the Education ROI calculator. The matching Spring Boot
backend lives in `roi-calculator-backend-main/`.

## Tech stack

- React 18, TypeScript, Vite
- shadcn/ui (Radix) + Tailwind CSS
- React Router, React Query, Axios
- Framer Motion, Recharts, react-helmet-async
- Vitest for tests

## Features

- **Light, dark and system themes** — the header toggle switches instantly, remembers the choice
  in local storage, and applies the stored theme before first paint to avoid a light flash.
  Browser chrome colours follow the active theme.

## Getting started

```sh
# 1. Install dependencies
npm install

# 2. Configure the API URL (copy the example and adjust if needed)
cp .env.example .env.local

# 3. Start the frontend (http://localhost:8081)
npm run dev
```

The backend listens on `http://localhost:8080` by default (see
`roi-calculator-backend-main/src/main/resources/application.properties`). Start it separately so
the reference-data and calculation endpoints are available. The backend's `app.public-base-url`
points at `http://localhost:8081`, which is why the frontend dev server uses that port.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build |
| `npm run build:dev` | Development-mode build |
| `npm run lint` | ESLint |
| `npm test` | Run the test suite once |
| `npm run test:watch` | Run tests in watch mode |

## Deployment

Set `VITE_API_URL` to the production backend URL at build time. All routes except static assets
must fall back to `index.html` so React Router can handle deep links such as `/results/:uuid`.
