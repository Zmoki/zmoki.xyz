# Zmoki Monorepo

This is a monorepo containing the Zmoki digital garden and related projects.

## Structure

- `apps/zmoki-pages/` - The main Astro website (zmoki.xyz)
- `packages/` - Shared packages and utilities

## Getting Started

### Prerequisites

- Node.js 18+
- npm (comes with Node.js)

### Installation

```bash
npm install
```

### Development

```bash
# Start the zmoki-pages development server
npm run dev

# Or run from the specific app directory
cd apps/zmoki-pages && npm run dev
```

### Building

```bash
# Build all apps
npm run build:all

# Build only zmoki-pages
npm run build
```

## Available Scripts

- `npm run dev` - Start development server for zmoki-pages
- `npm run build` - Build zmoki-pages
- `npm run preview` - Preview built zmoki-pages
- `npm run clean` - Clean all node_modules and dist folders
- `npm run install:all` - Install dependencies for all workspaces
- `npm run build:all` - Build all workspaces

## Adding New Apps/Packages

To add a new app:

1. Create a new directory in `apps/`
2. Add a `package.json` with the appropriate name and dependencies
3. The workspace will automatically detect it

To add a new shared package:

1. Create a new directory in `packages/`
2. Add a `package.json` with the appropriate name and dependencies
3. Other workspaces can reference it using the package name
