# div-nar.github.io

Personal site of Divith Narendra. Plain HTML/CSS/JS — pages are static, no build step to serve them.

Live at [div-nar.github.io](https://div-nar.github.io).

## Writing a post

Posts live as Markdown under `posts/` (Writing) and `drinks/` (Off the Keg), compiled into static HTML.

```
bun run write   # opens the editor at localhost:5566
bun run build   # renders every published entry, updates index.html, off-the-keg.html and feed.xml
```

In the editor, pick **Writing** or **Off the Keg**, type, and:

- **Save** keeps a new entry as a private draft (`draft: true`, no page is built).
- **Preview** opens the page as it will look.
- **Publish** builds, commits only that entry's files, and pushes `main`. GitHub Pages is live a minute or two later. It refuses to run on any other branch.

Off the Keg entries take a *category* (Spirits, Wines or Beers) that shelves them like Books, a *maker* shown under the name, and an optional *where* and *rating* shown on the entry page.
