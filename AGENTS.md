# Repository workflow

- This website's canonical GitHub repository is `git@github.com:aperture-indigo/AI-Website.git`.
- Work on local `main`, tracking `origin/main`.
- When the user requests a push or repository sync, commit the intended website changes and push to `origin main`.
- Ordinary website edits do not authorize an automatic push.
- Preserve remote history; do not force-push or replace the repository.
- Edit components in `src/components/` and page templates in `scripts/build-pages.mjs`; run `npm run build` to update the tracked generated files in `public/`.
- Run `npm run check` before committing, plus syntax checks for modified animation engines as appropriate.
