# div-nar.github.io

Personal site of Divith Narendra. Plain HTML/CSS/JS — pages are static, no build step to serve them.

Live at [div-nar.github.io](https://div-nar.github.io).

## Writing a post

Posts are written in Markdown under `posts/` and compiled into static HTML.

```
npm run write   # opens a local editor UI at localhost:5566
npm run new -- "Post Title"   # or scaffold a post file by hand
npm run build   # renders posts/*.md -> {slug}.html, updates index.html and feed.xml
```

(`bun` works as a drop-in replacement for `npm` in all of the above.)
