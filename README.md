# div-nar.github.io

Personal site of Divith Narendra. Plain HTML/CSS/JS — pages are static, no build step to serve them.

Live at [div-nar.github.io](https://div-nar.github.io).

## Writing a post

Write at **[div-nar.github.io/write](https://div-nar.github.io/write/)** from any device. The first visit on a device asks for a GitHub token: a [fine-grained token](https://github.com/settings/personal-access-tokens/new) with access to this repo only and *Contents: Read and write*. It stays in that browser.

- Pick **Writing** or **Madeera**, type, and add a photo if you like (shrunk to 1600px before upload).
- Changes save in that browser as you type. Nothing is public until you press **Publish**.
- **Publish** commits the Markdown (and photo, under `images/`) to `main`. The `Deploy site` GitHub Action then builds the pages and the site updates in a minute or two.

Madeera entries take a *category* (Spirits, Wines or Beers) that shelves them like Books, a *maker* shown under the name, and an optional *where* and *rating* shown on the entry page.

Locally, `bun run build` renders `posts/*.md` and `drinks/*.md` into HTML and updates `index.html`, `madeera.html` and `feed.xml`. To try the editor without a token, serve the repo (`python3 -m http.server 8080`) and open `http://localhost:8080/write/?demo`.
