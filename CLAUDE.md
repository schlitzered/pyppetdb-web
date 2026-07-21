# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Vue 3 + TypeScript frontend for **PyppetDB** (a PuppetDB replacement). Manages Puppet nodes, node groups, Hiera data, a certificate authority, jobs, and users/teams.

Stack: Vue 3 (`<script setup>`), **PrimeVue 4** + **Tailwind 4**, Vite, Pinia, Vue Router, Axios, TanStack Vue Query, Monaco Editor.

> `GEMINI.md` is stale — it describes a Vuetify/JavaScript version of this app that no longer exists. Prefer this file.

## Commands

```bash
npm run dev              # dev server on :3000, proxies /api /oauth /docs /versions to https://127.0.0.1:8000
npm run build            # vue-tsc --noEmit && vite build  (type errors fail the build)
npm run test             # vitest run (unit)
npm run test:coverage
npm run test:e2e         # playwright; auto-starts `npm run dev`
npm run lint             # eslint src        (CI runs lint + test)
npm run lint:fix
npm run format           # prettier over src/
```

Run a single unit test file or case:

```bash
npx vitest run src/composables/__tests__/useResourceQuery.spec.ts
npx vitest run -t 'mounts successfully'
```

`node generate_tests.js` writes a smoke-mount `.spec.js` for **every** `.vue` file under `src/components/` and `src/views/`. It was used once to seed the suite; those seeds have since been replaced by ~17,700 lines of hand-written tests. **The script overwrites existing spec files in place with no prompt** — running it today destroys that work. Treat it as effectively deprecated; if you must use it for a new component, run it, keep only the new file, and `git checkout` everything else.

Coverage note: `vite.config.ts` has no `coverage` block, so `npm run test:coverage` silently omits files with no tests and reports ~95.8%. The true figure with `--coverage.all` is **92.76% stmts / 84.45% branch**; `src/router/`, `src/layouts/`, `src/plugins/` and `App.vue` are at 0%. There are no coverage thresholds, so nothing can fail a build.

`src/vitest.setup.ts` globally mocks both `vue-router` and `@/router` — tests for router guards must opt out explicitly. `primeVueStubs` in `src/__test_utils__/helpers.ts` is dead code: every entry is a Vuetify tag name (`v-card`, `v-btn`, …) left over from the pre-PrimeVue app, matching nothing in `src/`.

## Architecture: resource definitions drive everything

The app is built around declarative **resource definitions** rather than per-page components. Understanding this is the key to working here.

A `ResourceDefinition` (`src/types/resources.ts`) is a plain object describing one API-backed resource: its `apiBase`, route names/paths, nav entry, breadcrumbs, toolbar, `tableColumns`, `searchFilters`, form `fields`, and `permissions` predicates. Definitions live in `src/resources/{admin,nodes,hiera,ca,jobs}.ts` and are aggregated into a single `resources` object in `src/resources/index.ts`.

Three consumers read that object:

1. **`src/router/resources.ts`** — `generateResourceRoutes()` synthesizes a search route and (unless `searchOnly`) a CRUD route per resource, passing the definition through `meta.resource` into the `resourceDef` prop.
2. **`src/layouts/AppShell.vue`** — builds the sidebar nav from each definition's `nav` block, filtered by `requireAdmin` / `requiredPermission` against the auth store.
3. **`src/views/ResourceSearchView.vue` / `ResourceCrudView.vue`** — the generic list and form pages, rendering via `src/components/generic/ResourceTable.vue` and `ResourceForm.vue`.

**Consequence: adding a resource usually means adding a definition object and exporting it from `src/resources/index.ts` — no new routes, nav entries, or view components.**

When a resource genuinely can't be expressed declaratively, set `customSearchComponent` / `customFormComponent` to a component in `src/components/special/`. The router swaps it in for the generic view but still passes `resourceDef`, so these components should reuse the same composables rather than reimplementing fetch/pagination.

### Supporting layers

- **`src/api/client.ts`** — the only place Axios is called. `api.get/post/put/delete` serialize params via `URLSearchParams` (arrays repeat the key), report failures into the `apiError` store, and on `401` reset auth and redirect to `LoginError`. Pass `silent: true` to suppress the global error dialog. Never call Axios directly.
- **`src/composables/`** — `useResourceListQuery` (server-side pagination/sort/filter for list views, kept in sync with the URL query string via `useUrlStateSync`), `useResourceQuery` / `useResourceMutation` (single-item read/write), `useLogStream`, `useFieldProcessors`.
- **`src/stores/`** — Pinia setup-style stores: `auth` (user data + permission checks), `apiError` (global error dialog), `ui`.
- **URL is the source of truth** for list state. Page, limit, sort, and filters round-trip through the query string; `SearchFilterType.processor` (`toUrl`/`fromUrl`) handles filters whose form shape isn't a plain string — see `factFieldProcessor` in `src/resources/nodes.ts`.

### Permissions

Permission strings are built from `src/constants/permissions.ts` (`PERMISSIONS`), which mixes constants with functions for scoped permissions, e.g. `PERMISSIONS.CA.SPACES.CERTS.READ(spaceId)`. A resource declares `permissions.create/edit/delete` as predicates receiving `hasPermission`; admins short-circuit to `true` in the auth store. Use `hasPermissionPattern` / `getPermissionMatches` for regex-scoped checks (e.g. "which CA spaces may this user read?").

## Conventions

- **Prettier** (`.prettierrc.json`): no semicolons, single quotes, 2-space indent, **no trailing commas**. Run `npm run format` rather than hand-formatting.
- **One named import per line** is the prevailing style across `src/` — `import { ref } from 'vue'` then `import { watch } from 'vue'` on the next line, even from the same module. Match the surrounding file.
- `@/` aliases `src/`.
- Tests live in `__tests__/` next to the code. Shared mocks and PrimeVue component stubs are in `src/__test_utils__/helpers.ts` (`primeVueStubs`, `createMockResourceDef`, `createMockRoute`, `createMockRouter`) — use these instead of writing new mount boilerplate.
- Icons come from `@lucide/vue`; a `nav.icon` or `ToolbarItem.icon` is a Lucide component name string (e.g. `'Server'`).
- `@typescript-eslint/no-explicit-any` is disabled; `any` appears deliberately in URL-processor and form-data code.
- Source files carry an Apache-2.0 header comment; keep it when editing files that have one.
- `openapi.json` at the repo root is the backend's spec — consult it for endpoint shapes when adding a resource.

### Working style (from `.agents/AGENTS.md`)

Before writing code, apply "lazy senior dev" order: does it need to exist (YAGNI) → can a built-in or native platform feature do it → can it be one line → build the minimum that works. Avoid unrequested abstractions and dependencies. Mark intentional simplifications with a `// ponytail:` comment (see `src/api/client.ts` for an example).