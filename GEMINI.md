# GEMINI.md - pyppetdb-web

## Project Overview

**pyppetdb-web** is a modern Vue 3 web application designed as the frontend for **PyppetDB**, a PuppetDB replacement. It provides a user-friendly interface for managing Puppet nodes, team permissions, Hiera data, and more.

### Key Technologies
- **Vue 3**: Core frontend framework using the Composition API (`<script setup>`).
- **Vuetify 3**: Material Design component library for UI/UX.
- **Vite**: Fast build tool and development server.
- **Pinia**: State management for API errors, login data, etc.
- **Vue Router**: Client-side routing with modularized route definitions.
- **Axios**: HTTP client for communicating with the PyppetDB backend.

### Architecture
- **API Layer**: Centralized in `src/api/common.js`. It includes a generic `request` method that handles common tasks like parameter serialization (using `qs`) and error reporting via Pinia.
- **State Management**: Uses Pinia stores located in `src/store/`. Examples include `api_error.js` for global error handling and `login_data.js` for authentication state.
- **Routing**: Routes are split by resource type (e.g., `src/router/routes_nodes.js`) and aggregated in `src/router/routes.js`.
- **Reusable Logic**: Custom composables like `useDataTable` in `src/common/datatable_generic.js` encapsulate complex logic for server-side tables, including pagination, sorting, filtering, and URL state synchronization.
- **Layouts & Views**: Follows a standard Vue project structure with `src/layouts/` for high-level page structures and `src/views/` for page-specific components.

---

## Building and Running

### Prerequisites
- Node.js 22 or higher
- npm (or compatible package manager like yarn/pnpm)

### Development
Starts the development server on `http://localhost:3000`. It proxies API requests to `http://localhost:8000` by default (see `vite.config.js`).
```bash
npm run dev
```

### Production
Builds the application for production into the `dist/` directory.
```bash
npm run build
```
Preview the production build locally.
```bash
npm run preview
```

### Code Quality
Run ESLint to check for code issues.
```bash
npm run lint
```
Automatically fix linting issues.
```bash
npm run lint:fix
```
Format the entire `src/` directory using Prettier.
```bash
npm run format
```

---

## Development Conventions

### Coding Style
- **Composition API**: Always prefer the Vue 3 Composition API with `<script setup>`.
- **Vuetify Components**: Utilize Vuetify's built-in components for UI elements to maintain a consistent Material Design aesthetic.
- **Resource Modularity**: When adding new features or resources, create dedicated route files in `src/router/` and keep views/components organized by resource.
- **Type Safety**: While primarily a JavaScript project, use clear naming and consistent data structures.
- **Linting**: Adhere to the project's ESLint and Prettier configurations (`eslint.config.mjs`, `.prettierrc.json`).

### Common Patterns
- **Data Tables**: Use the `useDataTable` composable from `src/common/datatable_generic.js` for any server-side listing to ensure consistent behavior for pagination, sorting, and URL-synced state.
- **API Calls**: Always use the wrapper in `src/api/common.js` rather than raw Axios calls to benefit from centralized error handling and parameter serialization.
- **URL Synchronization**: Search filters and table state should be synced with the URL query parameters using the utilities in `src/common/url_state_sync.js`.

### Testing
- No explicit test suite was found in the current codebase (e.g., Vitest or Cypress). 
- **TODO**: Implement unit and integration tests to ensure long-term stability.
