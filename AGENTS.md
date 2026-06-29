# Repository Guidelines

## Project Structure & Module Organization
This repository is currently empty, so contributors should establish a predictable layout as files are added. Keep application code in `src/`, tests in `tests/`, static assets in `public/` or `assets/`, and project notes or design docs in `docs/`. Place root-level config files only when they apply to the whole project, such as `package.json`, `.editorconfig`, or CI settings.

## Build, Test, and Development Commands
Add scripts through the primary project toolchain and document them in the root manifest. For a Node-based setup, prefer:

- `npm install` to install dependencies
- `npm run dev` to start a local development server
- `npm test` to run the automated test suite
- `npm run build` to create a production build

If a different stack is introduced, keep equivalent commands consistent and update this file.

## Coding Style & Naming Conventions
Use 2-space indentation for JSON, YAML, and Markdown. Follow the formatter and linter adopted by the project once they are added, and commit both configuration files with the related code. Prefer `PascalCase` for component or class names, `camelCase` for variables and functions, and `kebab-case` for file names unless a framework requires otherwise.

## Testing Guidelines
Mirror the `src/` structure under `tests/` where practical. Name tests after the unit under test, such as `tests/auth/login.test.js` or `tests/components/header.spec.ts`. Add tests for new features and bug fixes before opening a pull request. If coverage tooling is introduced, maintain or improve the current baseline.

## Commit & Pull Request Guidelines
No Git history is available in this workspace, so use a clear imperative commit style such as `Add landing page hero` or `Fix API error handling`. Keep commits focused and logically grouped. Pull requests should include a short summary, testing notes, linked issues when relevant, and screenshots for UI changes.

## Configuration & Security
Do not commit secrets, API keys, or local `.env` files. Provide a checked-in example file such as `.env.example` for required environment variables. Review new dependencies before adding them and prefer minimal, well-maintained packages.
