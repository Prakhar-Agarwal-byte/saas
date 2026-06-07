# saas

Shared React component library and shadcn registry for SaaS applications.

This repo supports two consumption modes:

- Package imports, such as `import { Button } from "saas/button"`.
- shadcn registry installs, such as `shadcn add @saas/button`.

The registry mode is the preferred option when an app should own copied source files and keep using its own `components.json` aliases.

## Contents

- `src/components/ui` - shadcn/base-ui primitives.
- `src/app-blocks.tsx` - dashboard page, metric, filter, panel, and status blocks.
- `src/styles.css` - blue/white SaaS design tokens.
- `registry/` - generated alias-safe registry source files.
- `registry.json` - generated shadcn registry manifest.
- `public/r/` - generated static JSON files to host as a shadcn registry.

## Package Usage

Install the package in a consuming app:

```bash
pnpm add saas
```

Import the token CSS from the consuming app's global CSS:

```css
@import "saas/styles.css";
```

Use component subpath imports:

```tsx
import { Button } from "saas/button";
import { Card, CardContent, CardHeader, CardTitle } from "saas/card";
import { AppPageHeader } from "saas/app-blocks";
```

For Next.js apps consuming source exports, add this to `next.config.ts`:

```ts
const nextConfig = {
  transpilePackages: ["saas"],
};
```

## shadcn Registry Usage

Build the static registry JSON:

```bash
pnpm registry:build
```

Serve it locally:

```bash
pnpm registry:serve
```

That serves registry items at:

```txt
http://localhost:3333/r/{name}.json
```

Add the registry to a consuming app:

```bash
pnpm dlx shadcn@latest registry add @saas=https://raw.githubusercontent.com/Prakhar-Agarwal-byte/saas/main/public/r/{name}.json
```

Or add it manually to the app's `components.json`:

```json
{
  "registries": {
    "@saas": "https://raw.githubusercontent.com/Prakhar-Agarwal-byte/saas/main/public/r/{name}.json"
  }
}
```

Then search and install:

```bash
pnpm dlx shadcn@latest search @saas -q button
pnpm dlx shadcn@latest add @saas/saas-base
pnpm dlx shadcn@latest add @saas/button
pnpm dlx shadcn@latest add @saas/app-blocks
```

Install everything in one command:

```bash
pnpm dlx shadcn@latest add @saas/saas-kit
```

## Hosting

Deploy the `public/` directory to any static host. If the host is `https://ui.example.com`, consuming apps should configure:

```json
{
  "registries": {
    "@saas": "https://ui.example.com/r/{name}.json"
  }
}
```

The shadcn MCP server reads the same `components.json` registry configuration, so once `@saas` is configured it can list, search, view, and generate add commands for these components.

## Maintenance

Run package checks from the repo root:

```bash
pnpm typecheck
pnpm build
pnpm registry:validate
pnpm registry:build
```

When adding or changing components, edit `src/` first. The registry source and static JSON are generated from `src/` by `pnpm registry:build`.
