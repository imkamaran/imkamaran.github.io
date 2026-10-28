# imkamaran.github.io

Personal site for [@imkamaran](https://github.com/imkamaran), live at **https://imkamaran.github.io**.

A static page (no build step) that lists my public repositories. It renders instantly from a
snapshot in `script.js`, then refreshes from the GitHub API on each visit (cached for 10 minutes),
so new repos, stars and topics show up automatically.

- `index.html` – markup and hero copy
- `style.css` – design tokens (light + dark), layout, components
- `script.js` – data snapshot, GitHub API fetch, rendering, search/sort, theme toggle

To preview locally: `python -m http.server` and open http://localhost:8000.
