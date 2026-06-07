import { readFileSync } from "node:fs";
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const registryDir = path.join(root, "registry");
const registrySchema = "https://ui.shadcn.com/schema/registry.json";
const repositoryUrl = "https://github.com/Prakhar-Agarwal-byte/saas";

const sharedTargets = {
  utils: {
    source: "src/lib/utils.ts",
    output: "registry/lib/utils.ts",
    target: "@lib/utils.ts",
    type: "registry:lib",
    title: "Utils",
    description: "Shared cn utility for Tailwind class composition.",
  },
  "use-mobile": {
    source: "src/hooks/use-mobile.ts",
    output: "registry/hooks/use-mobile.ts",
    target: "@hooks/use-mobile.ts",
    type: "registry:hook",
    title: "Use Mobile",
    description: "Responsive media-query hook used by navigation primitives.",
  },
  "card-frame": {
    source: "src/card-frame.ts",
    output: "registry/lib/card-frame.ts",
    target: "@lib/card-frame.ts",
    type: "registry:lib",
    title: "Card Frame",
    description: "Shared card frame class for quiet B2B dashboard surfaces.",
  },
  "labeled-field": {
    source: "src/labeled-field.tsx",
    output: "registry/components/labeled-field.tsx",
    target: "@components/labeled-field.tsx",
    type: "registry:component",
    title: "Labeled Field",
    description: "Small labeled field wrapper built on the field primitive.",
  },
  "app-blocks": {
    source: "src/app-blocks.tsx",
    output: "registry/components/app-blocks.tsx",
    target: "@components/app-blocks.tsx",
    type: "registry:component",
    title: "App Blocks",
    description: "Composable SaaS dashboard blocks for pages, metrics, filters, panels, and status badges.",
  },
};

await rm(registryDir, { recursive: true, force: true });
await mkdir(registryDir, { recursive: true });

const uiNames = (await readdir(path.join(root, "src/components/ui")))
  .filter((file) => file.endsWith(".tsx"))
  .map((file) => file.replace(/\.tsx$/, ""))
  .sort();

const targets = new Map();

for (const [name, target] of Object.entries(sharedTargets)) {
  targets.set(name, target);
}

for (const name of uiNames) {
  targets.set(name, {
    source: `src/components/ui/${name}.tsx`,
    output: `registry/ui/${name}.tsx`,
    target: `@ui/${name}.tsx`,
    type: "registry:ui",
    title: titleFromName(name),
    description: `${titleFromName(name)} primitive for SaaS applications.`,
  });
}

const generatedContent = new Map();

for (const [name, target] of targets) {
  const sourcePath = path.join(root, target.source);
  const outputPath = path.join(root, target.output);
  const source = await readFile(sourcePath, "utf8");
  const content = transformImports(source, target);
  generatedContent.set(name, content);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, content);
}

const depsByName = new Map();
const npmDepsByName = new Map();

for (const [name, content] of generatedContent) {
  depsByName.set(name, internalDependencies(name, content));
  npmDepsByName.set(name, npmDependencies(content));
}

const baseItem = buildBaseItem();
const items = [
  baseItem,
  buildItem("utils"),
  buildItem("use-mobile"),
  buildItem("card-frame"),
  ...uiNames.map((name) => buildItem(name)),
  buildItem("labeled-field"),
  buildItem("app-blocks"),
  buildKitItem(),
];

const registry = {
  "$schema": registrySchema,
  name: "saas",
  homepage: repositoryUrl,
  items,
};

await writeFile(path.join(root, "registry.json"), `${JSON.stringify(registry, null, 2)}\n`);

function buildItem(name) {
  const target = targets.get(name);
  const closure = dependencyClosure(name);
  return clean({
    name,
    type: target.type,
    title: target.title,
    description: target.description,
    dependencies: collectNpmDependencies(closure),
    files: closure.map((depName) => fileEntry(depName)),
  });
}

function buildKitItem() {
  const names = [
    "utils",
    "use-mobile",
    "card-frame",
    ...uiNames,
    "labeled-field",
    "app-blocks",
  ];
  const closure = unique(names.flatMap((name) => dependencyClosure(name)));
  const base = buildBaseItem();
  return clean({
    name: "saas-kit",
    type: "registry:block",
    title: "SaaS Kit",
    description: "Install every saas primitive, helper, and app block in one shadcn add command.",
    dependencies: unique([...(base.dependencies ?? []), ...collectNpmDependencies(closure)]),
    cssVars: base.cssVars,
    css: base.css,
    files: closure.map((name) => fileEntry(name)),
  });
}

function buildBaseItem() {
  const vars = parseCssVars();
  return clean({
    name: "saas-base",
    type: "registry:base",
    title: "SaaS Base",
    description: "Blue and white SaaS dashboard theme tokens for shadcn applications.",
    config: {
      style: "base-nova",
      iconLibrary: "lucide",
      tailwind: {
        baseColor: "neutral",
        cssVariables: true,
      },
    },
    dependencies: [
      "class-variance-authority",
      "clsx",
      "lucide-react",
      "tailwind-merge",
      "tw-animate-css",
    ],
    cssVars: {
      theme: vars.theme,
      light: vars.light,
      dark: vars.dark,
    },
    css: {
      "@layer base": {
        "*": {
          "@apply border-border outline-ring/50": {},
        },
        body: {
          "@apply bg-background text-foreground": {},
          "letter-spacing": "var(--tracking-normal)",
          "font-feature-settings": "\"cv02\", \"cv03\", \"cv04\", \"cv11\"",
        },
        html: {
          "@apply font-sans": {},
        },
        "::selection": {
          background: "color-mix(in srgb, var(--primary) 18%, transparent)",
        },
      },
    },
  });
}

function fileEntry(name) {
  const target = targets.get(name);
  return {
    path: target.output,
    type: target.type,
    target: target.target,
  };
}

function dependencyClosure(name, seen = new Set()) {
  if (seen.has(name)) {
    return [];
  }
  seen.add(name);
  const deps = depsByName.get(name) ?? [];
  return unique([
    ...deps.flatMap((dep) => dependencyClosure(dep, seen)),
    name,
  ]);
}

function collectNpmDependencies(names) {
  return unique(names.flatMap((name) => npmDepsByName.get(name) ?? []));
}

function internalDependencies(self, content) {
  const deps = [];
  for (const match of content.matchAll(/from\s+["']@\/components\/ui\/([^"']+)["']/g)) {
    deps.push(match[1]);
  }
  if (content.includes("@/lib/utils")) {
    deps.push("utils");
  }
  if (content.includes("@/hooks/use-mobile")) {
    deps.push("use-mobile");
  }
  return unique(deps.filter((dep) => dep !== self && targets.has(dep)));
}

function npmDependencies(content) {
  const deps = [];
  for (const match of content.matchAll(/from\s+["']([^"']+)["']/g)) {
    const specifier = match[1];
    if (specifier.startsWith(".") || specifier.startsWith("@/")) {
      continue;
    }
    const dep = normalizePackageName(specifier);
    if (dep && dep !== "react") {
      deps.push(dep);
    }
  }
  return unique(deps);
}

function normalizePackageName(specifier) {
  if (specifier.startsWith("@")) {
    const [scope, name] = specifier.split("/");
    return scope && name ? `${scope}/${name}` : specifier;
  }
  return specifier.split("/")[0];
}

function transformImports(source, target) {
  let content = source;

  content = content
    .replaceAll('from "../../lib/utils"', 'from "@/lib/utils"')
    .replaceAll("from '../../lib/utils'", "from '@/lib/utils'")
    .replaceAll('from "../../hooks/use-mobile"', 'from "@/hooks/use-mobile"')
    .replaceAll("from '../../hooks/use-mobile'", "from '@/hooks/use-mobile'")
    .replace(/from\s+["']\.\/components\/ui\/([^"']+)["']/g, 'from "@/components/ui/$1"')
    .replace(/from\s+["']\.\/lib\/utils["']/g, 'from "@/lib/utils"')
    .replace(/from\s+["']\.\/hooks\/use-mobile["']/g, 'from "@/hooks/use-mobile"');

  if (target.type === "registry:ui") {
    content = content.replace(/from\s+["']\.\/([^"'.]+)["']/g, 'from "@/components/ui/$1"');
  }

  return content;
}

function parseCssVars() {
  const css = readFileSync(path.join(root, "src/styles.css"), "utf8");
  return {
    theme: pickThemeVars(readVars(css, "@theme inline")),
    light: readVars(css, ":root"),
    dark: readVars(css, ".dark"),
  };
}

function readVars(css, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = css.match(new RegExp(`${escaped}\\s*\\{([\\s\\S]*?)\\n\\}`));
  if (!match) {
    return {};
  }
  return Object.fromEntries(
    [...match[1].matchAll(/--([a-zA-Z0-9-]+):\s*([^;]+);/g)].map(([, key, value]) => [
      key,
      value.trim(),
    ])
  );
}

function pickThemeVars(vars) {
  return Object.fromEntries(
    Object.entries(vars).filter(([key]) =>
      [
        "font-sans",
        "font-mono",
        "font-heading",
        "font-serif",
        "radius",
        "tracking-normal",
      ].includes(key)
    )
  );
}

function unique(values) {
  return [...new Set(values)].sort();
}

function clean(value) {
  return JSON.parse(JSON.stringify(value, (_key, current) => {
    if (Array.isArray(current) && current.length === 0) {
      return undefined;
    }
    return current;
  }));
}

function titleFromName(name) {
  return name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
