# Automator

A web app for building and filling structured prompt templates for AI tools.

Instead of typing the same long, detailed prompt every time you use an AI assistant, you define a template once — a form with fields like sliders, toggles, dropdowns, and text inputs. You fill in the form, and Automator compiles it into a clean markdown prompt ready to paste into any AI tool.

**Live app:** https://gypelayo.github.io/automator-ui/

## What it does

- **Fill templates** — structured forms that compile to a markdown prompt
- **Create templates** — build your own with a visual editor, no code needed
- **Import / export** — share templates as JSON files
- **Themes** — several colour themes to match your preference

## Use cases

- Travel planning prompts with destinations, budget, and preferences pre-filled
- Code review or refactoring instructions with consistent structure
- Any repetitive AI prompt that has configurable parameters

## Development

```
pnpm install
pnpm dev        # starts the UI at http://localhost:5173
```

## Stack

- React + TypeScript + Vite
- Tailwind CSS
- Zustand (state + localStorage persistence)
- Monorepo with `packages/core` (shared types/compiler) and `packages/automator-ui` (the app)
