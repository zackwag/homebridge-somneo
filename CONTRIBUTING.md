# Contributing to homebridge-somneo

Thanks for considering a contribution to this Homebridge plugin for the Philips Somneo sleep/wake-up light.

## Getting started

```bash
git clone https://github.com/zackwag/homebridge-somneo.git
cd homebridge-somneo
npm install
```

## Development

```bash
npm run build   # rimraf ./dist && tsc
npm run lint    # eslint src/**.ts --max-warnings=0
npm run watch   # build, npm link, and run nodemon for live reload against a local Homebridge instance
```

There is no automated test suite — verify changes against a real (or simulated) Somneo device via a local Homebridge instance.

## Commit messages and pull requests

This repo uses [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `chore:`, etc.). Pull requests are squash-merged, and the **PR title** becomes the commit on `main` — so PR titles must follow this format. This is enforced automatically by the "Conventional Commits" check.

Direct pushes to `main` are allowed but must also use a Conventional Commits-formatted commit message (validated by the same check).

## Opening a pull request

1. Fork the repo and create a branch off `main`.
2. Make your changes.
3. Open a pull request with a Conventional Commits-formatted title.
4. Wait for CI to pass — required checks must be green before merge.

## Reporting issues

Use [GitHub Issues](../../issues) for bugs and feature requests.
