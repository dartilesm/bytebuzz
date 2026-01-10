# ByteBuzz AI Coding Instructions

You are a Senior Software Engineer working on ByteBuzz, a social platform for developers.
Follow these instructions to ensure code quality, consistency, and maintainability.

## 🏗️ Architecture & Tech Stack

- **Framework**: Next.js 16 (App Router), React 19, TypeScript 5.
- **Styling**: Tailwind CSS, HeroUI, Lucide Icons.
- **Backend**: Supabase (Postgres, Storage, Realtime).
- **Auth**: Clerk (Authentication) integrated with Supabase (Authorization/RLS).
- **State**: React Query (`@tanstack/react-query`) for server state, `nuqs` for URL state.
- **Testing**: Vitest.
- **Tooling**: Biome (Linting/Formatting), Turbopack.

## 🧩 Key Patterns & Conventions

### Service Layer Pattern

- **Location**: `src/lib/db/services/*.service.ts`
- **Structure**: Encapsulate DB logic in service functions.
- **Context**: Use `this: ServiceContext` to access auth tokens.
- **Export**: Wrap service objects with `createServiceWithContext`.
- **Example**:
  ```typescript
  async function getFeed(this: ServiceContext) {
    const supabase = createServerSupabaseClient({ accessToken: this.accessToken });
    return await supabase.from("posts").select("*");
  }
  export const postService = createServiceWithContext({ getFeed });
  ```

### Server Actions

- **Location**: `src/actions/*.ts`
- **Usage**: Call services, handle auth checks via `currentUser()`, and revalidate paths.
- **Mutations**: Pair with `useMutation` hooks in `src/hooks/mutation`.

### Component Guidelines

- **Definition**: Use `function ComponentName() { ... }`.
- **Filenames**: Kebab-case (e.g., `user-profile.tsx`).
- **Conditionals**: Use explicit checks (`{condition && <Component />}`), avoid ternary for elements.
- **Logic**: Use early returns, avoid `switch` statements.
- **Effects**: Avoid `useEffect`. Prefer event handlers or derived state.
- **Icons**: Use `lucide-react` (e.g., `<UserIcon />`).

### Data Fetching & State

- **Client**: Use React Query hooks (`useQuery`, `useMutation`).
- **URL State**: Use `nuqs` (`useQueryState`) for filter/sort params.
- **Supabase**: Use `createServerSupabaseClient` in services/actions.

## 🛠️ Developer Workflow

- **Dev Server**: `npm run dev`
- **Testing**: `npm run test` (Vitest). Co-locate tests (`.test.ts`) with source.
- **Linting**: `npm run lint` (Biome).
- **Database**:
  - `npm run db:diff`: Check schema changes.
  - `npm run db:push-remote`: Push changes to Supabase.
  - `npm run db:gen-types`: Generate TypeScript types (if configured).

## 🧪 Testing Strategy

- **Unit Tests**: Focus on services and utility functions.
- **Structure**: `describe('filename', () => { describe('function', () => { it('should...', () => { ... }) }) })`.
- **Mocking**: Mock Supabase calls in service tests.

## 🚨 Critical Rules

1.  **Never** use `switch` statements; use `if/return`.
2.  **Always** use `createServiceWithContext` for new services.
3.  **Always** use `nuqs` for URL search parameters.
4.  **Prefer** `lucide-react` over other icon libraries.
5.  **Follow** the "Service -> Action -> Component" data flow for mutations.

## 📝 Pull Request Guidelines

When creating a Pull Request description, follow this template:

## Describe your changes

### Include a screenshot where applicable

## Issue ticket number and link
