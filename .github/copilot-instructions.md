# Copilot Instructions

This repository is the ChurchOS Next.js application for church operations management.

## Preferred stack
- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- Supabase SSR
- shadcn/ui-inspired component structure

## Code expectations
- Keep code typed and production-safe.
- Favor small, focused components and server-first data flow.
- Reuse existing patterns from `components/ui`, `lib/supabase`, and the app routing structure before creating new abstractions.
- Preserve the French product language and overall ChurchOS design language.
- Avoid unnecessary refactors and keep changes scoped to the task.

## Validation
- Run `npm run typecheck` after significant updates.
- Run `npm run lint` when changing UI or app logic.

## Repo layout
- `app/` for page and route structure
- `components/` for UI components and theming
- `lib/` for config and shared utilities
- `actions/` for server actions
- `schemas/` for validation schemas
- `services/` for domain logic
- `supabase/` for database migrations and scripts

## Guardrails
- Respect user privacy and avoid exposing secrets or tokens.
- Be careful with Supabase auth and RLS assumptions.
- Do not create broad framework changes without explicit instruction.
