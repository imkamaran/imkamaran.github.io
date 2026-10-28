# imkamaran.github.io

[![Deploy site](https://github.com/imkamaran/imkamaran.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/imkamaran/imkamaran.github.io/actions/workflows/deploy.yml)

Personal site for [@imkamaran](https://github.com/imkamaran), cyber security researcher, pentester
and Android developer. Live at **https://imkamaran.github.io**.

A static page covering what I work on and listing my public repositories. Repo data is baked in
at deploy time and refreshed live from the GitHub API in the browser, so the list stays current
on its own.

## Updating the site

| I want to…                         | Do this                                                                     |
| ---------------------------------- | --------------------------------------------------------------------------- |
| Change text, links or styling      | Edit `index.html` / `style.css` and push to `main` (live in ~1 minute)        |
| Show a new repo, stars or topics   | Nothing: it refreshes every 6 hours, and live in the browser on each visit   |
| Redeploy right now                 | Actions → **Deploy site** → **Run workflow**, or `gh workflow run deploy.yml` |
| Redeploy from another repo's CI    | `gh api repos/imkamaran/imkamaran.github.io/dispatches -f event_type=refresh` |

## How deployment works

`.github/workflows/deploy.yml` runs on push, on a schedule, on demand and on `repository_dispatch`.
It runs `scripts/build.mjs`, which:

1. Fetches the profile, public repos and each fork's upstream from the GitHub API, using the
   workflow token for a higher rate limit.
2. Rewrites the snapshot between the `@snapshot` markers in `script.js`. If the API is unavailable,
   it keeps the committed snapshot instead of failing.
3. Adds a content hash to the `style.css` / `script.js` URLs so browsers load new versions right away.
4. Writes the result to `_site/`, which is uploaded and deployed with GitHub Pages.

Each run's summary shows how many repos and stars were deployed.

> GitHub pauses scheduled workflows in repos with no activity for 60 days. Any push, or a manual
> run, turns it back on.

## Files

- `index.html`: markup and copy (hero, focus areas)
- `style.css`: design tokens (light + dark), layout, components
- `script.js`: data snapshot, live GitHub fetch, rendering, search/sort, theme toggle
- `scripts/build.mjs`: build step used by the workflow (Node 18+, no dependencies)

## Local preview

```sh
python -m http.server            # serve the source as-is, or:
node scripts/build.mjs && python -m http.server -d _site   # preview exactly what gets deployed
```
