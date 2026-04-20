# metronic_react_v8.2.3_demo1 Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-04-20

## Active Technologies
- localStorage (mock user store, lockout, rate limit); in-memory Map (reset tokens) (001-user-auth)
- TypeScript 5.3.3 + React 18.2, React Router DOM 6.30.3, Formik 2.2.9, Yup 1.0, React Table 7.7.0, React Intl 6.4.4, Bootstrap 5 + Metronic SCSS (002-user-management)
- **Supabase (PostgreSQL)** — backend database; JS client via `src/app/lib/supabaseClient.ts` replaces all mock data
- **Supabase Storage** — file uploads use the `avatars` bucket; `public/uploads/` is retired
- Profile pictures stored via Supabase Storage (avatars bucket) — Base64/FileReader pattern is retired (002-user-management)

- TypeScript 5.3.3 + React 18.2, React Router DOM 6.30, Formik 2.2.9, Yup 1.0, Axios 1.13.5, React Intl 6.4.4 (001-user-auth)

## Project Structure

```text
backend/
frontend/
tests/
```

## Commands

npm test; npm run lint

## Code Style

TypeScript 5.3.3: Follow standard conventions

## Recent Changes
- 002-user-management: Added TypeScript 5.3.3 + React 18.2, React Router DOM 6.30.3, Formik 2.2.9, Yup 1.0, React Table 7.7.0, React Intl 6.4.4, Bootstrap 5 + Metronic SCSS
- 001-user-auth: Added TypeScript 5.3.3 + React 18.2, React Router DOM 6.30, Formik 2.2.9, Yup 1.0, Axios 1.13.5, React Intl 6.4.4

- 001-user-auth: Added TypeScript 5.3.3 + React 18.2, React Router DOM 6.30, Formik 2.2.9, Yup 1.0, Axios 1.13.5, React Intl 6.4.4

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
