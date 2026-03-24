# Job Tracker Frontend

Frontend dashboard for tracking job applications. Built with Next.js App Router and Tailwind CSS.

## Features

- Job application list with pagination and filters
- Analytics cards (total and per-status counts)
- Create and edit workflows in inline modal forms
- Delete with confirmation
- Strong frontend validation plus backend error fallback
- Full integration with backend jobs APIs

## Backend API Coverage

The frontend integrates all job endpoints from the Go backend controller:

- POST /jobs
- GET /jobs
- GET /jobs/{id}
- PUT /jobs/{id}
- DELETE /jobs/{id}
- GET /jobs/exists?apply_link=...

## Status Values

- applied
- interview
- offer
- rejected
- withdrawn

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables:

```bash
cp .env.example .env.local
```

3. Start development server:

```bash
npm run dev
```

4. Open http://localhost:3000

## Environment Variables

- NEXT_PUBLIC_API_BASE_URL: Base URL of the Go backend. Default fallback in code is http://localhost:8080.

## Scripts

- npm run dev
- npm run build
- npm run start
- npm run lint

## Notes

- The UI uses client-side data fetching for responsive dashboard interactions.
- For create and update, apply links are normalized and checked for uniqueness via /jobs/exists.
- Backend remains the source of truth for validation and conflict handling.
