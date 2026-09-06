# AGENTS.md

This repository is a Next.js 15 application for ChurchOS, a church management platform built with the App Router, TypeScript, Tailwind CSS, and Supabase SSR.

## Project purpose
- Build and maintain a modern church operations platform for membership, attendance, finance, pastoral care, and ministry management.
- Prefer clean, component-driven UI patterns and secure server-side patterns around Supabase.
- Preserve the product language and branding in French where the UI already uses French copy.

## Stack and conventions
- Framework: Next.js 15, App Router, React 19
- Language: TypeScript
- Styling: Tailwind CSS with shadcn/ui-inspired reusable components
- Auth/data: Supabase via `@supabase/ssr` and browser/server clients
- Validation: Zod when formal data validation is needed
- Lint/type checks: `npm run lint` and `npm run typecheck`

## Repo structure
- `app/`: route-level pages, layouts, global app shell
- `components/`: reusable UI, layout, and theme components
- `lib/`: shared utilities and config
- `actions/`: server actions and mutation logic
- `services/`: domain/business logic
- `schemas/`: validation schemas
- `types/`: shared TypeScript types
- `supabase/`: SQL migrations and seed scripts

## Working rules
- Keep changes focused and minimal; avoid unnecessary refactors.
- Prefer server components for data fetching and client components only when interactivity is required.
- Use existing UI primitives in `components/ui/` before creating one-off components.
- Follow the established French labeling and product tone used in the landing page and app shell.
- Maintain type safety and avoid introducing unused imports or variables.
- For Supabase access, prefer the existing helper modules under `lib/supabase/`.
- If new validation logic is needed, add or update a schema under `schemas/` instead of scattering ad hoc checks.

## Common commands
- Install dependencies: `npm install`
- Run app locally: `npm run dev`
- Production build: `npm run build`
- Lint: `npm run lint`
- Type-check: `npm run typecheck`

## Expectations for AI coding agents
- Do not make broad rewrites unless the user explicitly asks for them.
- Preserve layout and design consistency with the current ChurchOS aesthetic.
- Keep root-cause fixes targeted and verify them with a relevant check when possible.
- When editing existing code, prefer the project’s conventions over introducing new patterns.
- If a task touches auth, database access, or permissions, be careful with tenant isolation and secure access patterns.

## Good defaults
- Prefer small, composable components.
- Add missing environment variable handling only when necessary and keep it explicit.
- When building new user-facing flows, keep them aligned with the existing UX and content strategy of the app.
