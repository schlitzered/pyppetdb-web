# pyppetdb-web


A modern Vue 3 web application for managing PyppetDB, a PuppetDB replacement.

## Features

- **Team Management**: Create and manage teams with LDAP group integration
- **User Management**: User administration and team assignments
- **Node Management**: PuppetDB node configuration management
- **Node Groups**: Dynamic node grouping with flexible filtering
- **Hiera Integration**: Facts override functionality for nodes
- **Modern UI**: Built with Vuetify 3 and Material Design Icons

## Tech Stack

- **Vue 3** - Progressive JavaScript framework
- **Vuetify 3** - Material Design component framework
- **Vite** - Next generation frontend tooling
- **Pinia** - Vue store/state management
- **Vue Router** - Official router for Vue.js
- **Axios** - HTTP client for API communication

## Prerequisites

- Node.js 22 or higher
- npm, yarn, or pnpm

## Installation

```bash
# Clone the repository
git clone https://github.com/schlitzered/pyppetdb-web.git
cd pyppetdb-web

# Install dependencies
npm install
```

## Development

```bash
# Start development server with hot-reload
npm run dev
```

The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

## Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

The built files will be in the `dist/` directory.

## Code Quality

```bash
# Lint code
npm run lint

# Lint and auto-fix
npm run lint:fix

# Format code with Prettier
npm run format
```

## Project Structure

```
src/
├── api/          # API client and endpoints
├── assets/       # Static assets
├── common/       # Common utilities
├── components/   # Reusable Vue components
├── layouts/      # Layout components
├── plugins/      # Vue plugins configuration
├── router/       # Vue Router configuration
├── store/        # Pinia stores
└── views/        # Page components
```

## Releases

Releases are automatically built and published via GitHub Actions when a new tag is pushed:

```bash
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

## License

See LICENSE file for details.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.
