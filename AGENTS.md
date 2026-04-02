# AGENTS.md — Automator UI project guide for AI agents

This file is the single source of truth for any AI agent working in this repository.
Read this first. It will save you many tool calls.

---

## What this project is

A web app that lets users configure **templates** — structured forms whose field values
compile to a markdown prompt that is sent to an AI orchestrator or copied manually.
There are two built-in templates (Travel Planner, Infra Monitor) and a full system for
creating, importing, and syncing custom templates.

Deployed at: **https://gypelayo.github.io/automator-ui/**

---

## Monorepo layout

```
packages/
  core/          — shared types, compiler helpers, template registry (no React)
  automator-ui/  — the React app (Vite + Tailwind + Zustand)
  api/           — local Hono server; agents POST templates here, UI polls it
```

Root `package.json` scripts:
```
pnpm dev          → dev server for automator-ui (port 5173)
pnpm dev:api      → dev server for the API (port 3000)
pnpm build        → production build of automator-ui
pnpm build:all    → build every package under packages/
```

---

## packages/core

**Source:** `packages/core/src/`

| File | Purpose |
|------|---------|
| `types.ts` | All shared TypeScript types |
| `registry.ts` | In-memory map of built-in templates |
| `compiler.ts` | Markdown compilation helpers + `createTemplateRender` |
| `index.ts` | Re-exports everything |

### Key types (`types.ts`)

```ts
// Every field has a `type` discriminant + `id` + `label`
type FieldSchema =
  | SliderField       // { min, max, step, default, minLabel?, maxLabel? }
  | ToggleField       // { default: boolean, description }
  | TextInputField    // { placeholder, default }
  | TextAreaField     // { placeholder, default, rows? }
  | SelectField       // { options: string[], default: string }
  | MultiSelectField  // { options: string[], default: string[] }
  | BudgetSplitField  // { entries: BudgetEntry[], default?: BudgetEntry[] }

type SectionSchema = { id, title, description?, fields: FieldSchema[] }

type Template = {
  id: string
  name: string
  description: string
  icon?: string          // single emoji
  sections: SectionSchema[]
  render: (values: FieldValues) => string   // NOT serialisable to JSON
}

type FieldValues = Record<string, number | boolean | string | string[] | BudgetEntry[]>
```

### Key functions (`compiler.ts`)

```ts
createTemplateRender(template)
  // Returns a generic render fn. Use for any template whose render
  // function cannot be serialised (all custom/imported templates).

compileFields(fields, values) → string   // markdown bullet list
section(title, body) → string            // ## Title\n\nbody\n
getDefaultValues(fields) → FieldValues
```

### Registry (`registry.ts`)

```ts
registerTemplate(template)                         // add to in-memory map
getTemplate(id, customTemplates?) → Template       // checks registry then customTemplates array
getAllTemplates(customTemplates?) → Template[]      // registry + customTemplates
```

Built-in templates are registered at app startup in
`packages/automator-ui/src/templates/index.ts`.

---

## packages/automator-ui

**Source:** `packages/automator-ui/src/`

### Directory structure

```
App.tsx                   — root component; mounts useAgentSync
templates/
  index.ts                — calls registerTemplate for all built-ins
  travel/index.ts         — Travel Planner template (custom render fn)
  infra-monitor/index.ts  — Infra Monitor template (custom render fn)
store/
  config.ts               — active template, field values, edit mode (persisted)
  templates.ts            — custom templates CRUD + rehydration (persisted)
  agent.ts                — agent URL + poll interval (persisted)
  theme.ts                — active theme (persisted)
hooks/
  useAgentSync.ts         — polls agentUrl/templates every pollInterval ms
components/
  layout/Sidebar.tsx      — template list, create/import/export, agent config
  builder/
    TemplateForm.tsx      — renders a template's sections as live form
    TemplateBuilder.tsx   — UI for creating/editing custom templates manually
  fields/                 — one component per FieldSchema type
  output/OutputPanel.tsx  — copy/download/reset compiled markdown
  ui/                     — shadcn-style primitives (Button, Input, etc.)
```

### Zustand stores

All stores use `zustand/middleware/persist` → localStorage.

| Store | Key | What it holds |
|-------|-----|--------------|
| `useConfigStore` | `automator-ui-config` | `activeTemplateId`, `templateValues`, `isEditMode`, `editingTemplateId` |
| `useTemplateStore` | `automator-templates` | `templates: Template[]` (custom only; built-ins are in the core registry) |
| `useAgentStore` | `automator-agent-config` | `agentUrl: string`, `pollInterval: number` |
| `useThemeStore` | `automator-theme` | `theme: ThemeId` |

**Important:** `Template.render` is a function and is lost on JSON serialisation.
`useTemplateStore` re-attaches it via `createTemplateRender` in `onRehydrateStorage`.
When you add a template programmatically always go through `useTemplateStore.addTemplate`
(never push directly into the array) so this is handled correctly.

### Agent sync flow

1. User pastes agent base URL into sidebar → saved in `useAgentStore.agentUrl`
2. `useAgentSync` (mounted in `App.tsx`) polls `GET {agentUrl}/templates` every
   `pollInterval` ms (default 5 s)
3. New templates are added; changed templates (name/description/icon/sections differ)
   are updated via `updateTemplate`
4. Network errors are silently swallowed — the agent may not be running

### How templates compile to markdown

```
template.render(values)
  → for built-in templates: custom hand-written render fn in templates/*/index.ts
  → for custom/imported:    createTemplateRender(template)(values)
      which calls compileFields(section.fields, values) per section
      and wraps each in section(title, body)
```

The compiled markdown string is what the user copies/exports and pastes into an
AI orchestrator.

### Themes

Available themes: `default | gruvbox | nord | dracula | tokyo | catppuccin | solarized`

CSS variables are set on `<html>` by `useThemeStore`. All colours reference
`hsl(var(--foreground))` etc. — never hardcoded hex.

---

## packages/api

**Source:** `packages/api/src/`

Hono server. Run with `bun run src/index.ts`. Requires env vars in `.env`
(copy `.env.example`).

### Routes

```
GET  /health                    → { ok: true }

POST /run                       → SSE stream; body: { compiledMarkdown }
                                  orchestrates a travel plan via OpenAI + Amadeus
                                  rate-limited to 5 req/IP/hour

GET    /templates               → TemplateDefinition[]  (in-memory store)
GET    /templates/:id           → TemplateDefinition
POST   /templates               → create/overwrite; body: TemplateDefinition
PUT    /templates/:id           → partial update
DELETE /templates/:id           → remove
```

**TemplateDefinition** (what the agent POSTs — no `render` fn):
```json
{
  "id": "kebab-case-id",
  "name": "Human Readable Name",
  "description": "One sentence.",
  "icon": "🛠️",
  "sections": [
    {
      "id": "section-id",
      "title": "Section Title",
      "description": "optional",
      "fields": [ ...FieldSchema objects... ]
    }
  ]
}
```

The UI generates `render` automatically from sections using `createTemplateRender`.

### CORS

Allowed origins: `http://localhost:5173`, `http://localhost:5174`,
`https://gypelayo.github.io`

---

## Adding a built-in template

1. Create `packages/automator-ui/src/templates/<name>/index.ts`
   exporting a `Template` object with a hand-written `render` function.
2. Import and call `registerTemplate(yourTemplate)` in
   `packages/automator-ui/src/templates/index.ts`.

The sidebar picks it up automatically — no other changes needed.

---

## Adding a new field type

1. Add the type to `FieldSchema` union in `packages/core/src/types.ts`
2. Handle it in `compileFields` switch in `packages/core/src/compiler.ts`
3. Create `packages/automator-ui/src/components/fields/<TypeName>Field.tsx`
4. Add a case in `packages/automator-ui/src/components/builder/TemplateForm.tsx`
   where fields are dispatched to their components
5. Add a case in `TemplateBuilder.tsx` (`handleAddField` and `FieldEditor`)

---

## Deployment

GitHub Actions (`.github/workflows/deploy.yml`) triggers on push to `main`:
1. Builds `@automator/automator-ui` (vite base = `/automator-ui/`)
2. Copies `dist/` to `pages/automator-ui/`
3. Writes a root `pages/index.html` that redirects to `/automator-ui/`
4. Uploads `pages/` as the GitHub Pages artifact

Final URL: `https://gypelayo.github.io/automator-ui/`

---

## Common tasks (quick reference)

| Task | Where to look |
|------|--------------|
| Change a built-in template's fields | `packages/automator-ui/src/templates/<name>/index.ts` |
| Change how markdown is compiled | `packages/core/src/compiler.ts` → `compileFields` |
| Add a sidebar button | `packages/automator-ui/src/components/layout/Sidebar.tsx` |
| Change polling interval default | `packages/automator-ui/src/store/agent.ts` |
| Add an API route | `packages/api/src/routes/` + register in `packages/api/src/index.ts` |
| Modify theme colours | `packages/automator-ui/src/index.css` (CSS variable blocks per theme) |
| Change the page `<title>` or favicon | `packages/automator-ui/index.html` |
