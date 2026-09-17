# AGENTS.md

## Project overview

homebridge-somneo is a TypeScript Homebridge plugin that exposes a Philips Somneo sleep/wake-up light (HF3670) as HomeKit accessories.

## Setup

```bash
npm install
```

## Build / Run

```bash
npm run build   # rimraf ./dist && tsc, compiles src/ to dist/
npm run watch   # build + npm link + nodemon, for local Homebridge testing
```

## Test

No automated test suite exists (no `test` script in `package.json`). Verify changes by running against a real or simulated Somneo device through a local Homebridge instance.

## Lint / Format

```bash
npm run lint   # eslint src/**.ts --max-warnings=0
```

## Repository structure

- `src/index.ts` — plugin entry point / platform registration
- `src/somneoPlatform.ts` — main platform + accessory logic
- `src/settings.ts` — plugin name/platform constants
- `config.schema.json` — Homebridge UI config schema

## Commit and PR conventions

- Commit messages and PR titles must follow [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`, `ci:`, `build:`, `perf:`, `style:`, `revert:`), optionally with a scope, e.g. `fix(api): handle null response`.
- This repo squash-merges pull requests only; the PR title becomes the final commit message on `master`.
- A "Conventional Commits" CI check enforces this on both PR titles and direct-push commit messages.
- Branch protection on `master`: no force-pushes, no branch deletion, required status checks must pass.
