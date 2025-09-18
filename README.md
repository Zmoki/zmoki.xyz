# Zmoki Monorepo

This is a monorepo containing the Zmoki digital garden and related projects.

## Structure

- `apps/zmoki-pages/` - The main Astro website (zmoki.xyz)
- `apps/tech-zmoki-pages/` - The tech blog (tech.zmoki.xyz)
- `packages/shared-components/` - Shared Astro components used by both apps

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

# Start the tech blog development server
npm run dev:tech

# Or run from the specific app directory
cd apps/zmoki-pages && npm run dev
cd apps/tech-zmoki-pages && npm run dev
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

## Shared Components

The `packages/shared-components/` package contains reusable Astro components that can be used across all apps.

### Available Components

- `Time` - Formats and displays dates
- `RawVideo` - Video player with autoplay and responsive design

### Using Shared Components

```astro
---
import { Time, RawVideo } from "@zmoki/shared-components";
---

<Time datetime={new Date()} />
<RawVideo src="/video.mp4" poster="/poster.jpg" />
```

### Adding New Shared Components

1. Add your component to `packages/shared-components/src/components/`
2. Export it in `packages/shared-components/src/index.ts`
3. Add the package as a dependency in your app's `package.json`:
   ```json
   {
     "dependencies": {
       "@zmoki/shared-components": "*"
     }
   }
   ```

## Adding New Apps/Packages

To add a new app:

1. Create a new directory in `apps/`
2. Add a `package.json` with the appropriate name and dependencies
3. The workspace will automatically detect it

To add a new shared package:

1. Create a new directory in `packages/`
2. Add a `package.json` with the appropriate name and dependencies
3. Other workspaces can reference it using the package name
