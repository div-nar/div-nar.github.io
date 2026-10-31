# div-nar.github.io

Personal site of Divith Narendra. Plain HTML/CSS/JS — pages are static, no build step to serve them.

Live at [div-nar.github.io](https://div-nar.github.io).

## Writing a post

Write at **[div-nar.github.io/write](https://div-nar.github.io/write/)** from any device. The first visit on a device asks for a GitHub token: a [fine-grained token](https://github.com/settings/personal-access-tokens/new) with access to this repo only and *Contents: Read and write*. It stays in that browser.

The editor is one plain-text box, like Bear Blog. Start with optional `key: value` lines, leave a blank line, then write Markdown:

```
title: Rain in Bengaluru
date: 2026-10-31
photo: images/posts/rain.jpg

It rained all day.
```

- `title:` and `date:` are required on every entry; a new entry starts with both, date set to today. Everything else is optional.
- `photo:` shows a photo beside the entry; **Add photo** fills it in. Paste or drop a photo into the text to put it inline. Photos shrink to 1600px before upload.
- `link:` sets the URL of a new entry. `draft: yes` saves it to the repo but keeps it off the site.
- Any other key you add is kept in the file, so you can start using it later.
- Changes save in that browser as you type. **Publish** (or Cmd+S) commits the Markdown and any photos to `main` in one commit. The `Deploy site` GitHub Action then builds the pages and the site updates in a minute or two.

Locally, `bun run build` renders `posts/*.md` and `drinks/*.md` into HTML and updates `index.html`, `madeera.html` and `feed.xml`. To try the editor without a token, serve the repo (`python3 -m http.server 8080`) and open `http://localhost:8080/write/?demo`.
