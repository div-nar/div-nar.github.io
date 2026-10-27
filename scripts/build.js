import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import { marked } from "marked";

export const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const templatePath = path.join(root, "templates", "post.html");
const feedPath = path.join(root, "feed.xml");

const SITE_URL = "https://div-nar.github.io";
const SITE_TITLE = "Divith Narendra";

// Each collection is a folder of Markdown files rendered into pages, plus a
// list spliced between <!-- MARKER:START/END --> comments in its index page.
export const collections = {
  posts: {
    label: "Writing",
    dir: "posts",
    index: "index.html",
    marker: "POSTS",
    out: (slug) => `${slug}.html`,
    backHref: "index.html",
    backLabel: "← Back to writing",
  },
  drinks: {
    label: "Madeera",
    dir: "drinks",
    index: "madeera.html",
    marker: "DRINKS",
    out: (slug) => `madeera-${slug}.html`,
    backHref: "madeera.html",
    backLabel: "← Back to Madeera",
    shelf: true,
  },
};

// Madeera is shelved like Books: a category in the gutter, in this order.
export const CATEGORIES = ["Spirits", "Wines", "Beers"];

// gray-matter parses `date: 2026-05-01` as UTC midnight, so format in UTC too;
// local time would shift the day back when built west of UTC.
function displayDate(date) {
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
}

function shortDate(date) {
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", timeZone: "UTC" });
}

export function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

export function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function escapeHtml(str) {
  return String(str).replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c]));
}

function indentBody(html) {
  return html
    .trim()
    .replaceAll("&#39;", "'")
    .replaceAll("&quot;", '"')
    .split("\n")
    .map((line) => (line ? `      ${line}` : line))
    .join("\n");
}

// Drinks show who made them, where, and a rating next to the date.
function details(entry) {
  return [entry.maker, entry.where, entry.rating].filter(Boolean);
}

export function readEntry(collection, slug) {
  const file = path.join(root, collections[collection].dir, `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  const { data, content } = matter(fs.readFileSync(file, "utf8"));
  if (!data.title || !data.date) {
    throw new Error(`${collection}/${slug}.md: frontmatter needs "title" and "date"`);
  }
  return {
    slug,
    title: String(data.title),
    date: new Date(data.date),
    category: data.category || "",
    maker: data.maker || "",
    where: data.where || "",
    rating: data.rating ? String(data.rating) : "",
    photo: data.photo || "",
    draft: Boolean(data.draft),
    body: content,
  };
}

// Every entry in a collection, drafts included, newest first.
export function loadEntries(collection) {
  const dir = path.join(root, collections[collection].dir);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md") && f !== "EXAMPLE.md")
    .map((f) => readEntry(collection, path.basename(f, ".md")))
    .sort((a, b) => b.date - a.date);
}

export function renderPage(collection, entry) {
  const c = collections[collection];
  const template = fs.readFileSync(templatePath, "utf8");
  const extra = details(entry).map((d) => ` · ${escapeHtml(d)}`).join("");
  return template
    .replaceAll("{{title}}", escapeHtml(entry.title))
    .replaceAll("{{displayDate}}", displayDate(entry.date))
    .replaceAll("{{isoDate}}", isoDate(entry.date))
    .replace("{{details}}", extra)
    .replace("{{mainClass}}", entry.photo ? ' class="has-photo"' : "")
    .replace("{{photo}}", entry.photo ? `<figure class="entry-photo"><img src="${escapeHtml(entry.photo)}" alt="${escapeHtml(entry.title)}" /></figure>\n    ` : "")
    .replace("{{backHref}}", c.backHref)
    .replace("{{backLabel}}", c.backLabel)
    .replace("{{body}}", indentBody(marked.parse(entry.body)));
}

function renderList(collection, entries) {
  const c = collections[collection];
  const byYear = new Map();
  for (const entry of entries) {
    const year = entry.date.getUTCFullYear();
    if (!byYear.has(year)) byYear.set(year, []);
    byYear.get(year).push(entry);
  }

  const groups = [...byYear.keys()].map((year) => {
    const items = byYear
      .get(year)
      .map((entry) => {
        return `        <li><a href="${c.out(entry.slug)}">${escapeHtml(entry.title)}</a><time datetime="${isoDate(entry.date)}">${shortDate(entry.date)}</time></li>`;
      })
      .join("\n");
    return `    <section class="archive-year" aria-labelledby="year-${year}">
      <h3 id="year-${year}">${year}</h3>
      <ul>
${items}
      </ul>
    </section>`;
  });

  return groups.join("\n");
}

function renderShelf(collection, entries) {
  const c = collections[collection];
  const known = new Set(CATEGORIES);
  const other = [...new Set(entries.map((e) => e.category).filter((k) => !known.has(k)))];
  return [...CATEGORIES, ...other]
    .map((category) => {
      const items = entries
        .filter((e) => e.category === category)
        .map((e) => {
          const maker = e.maker ? `<span class="book-author">${escapeHtml(e.maker)}</span>` : "";
          return `        <li><a href="${c.out(e.slug)}" class="book-title">${escapeHtml(e.title)}</a>${maker}</li>`;
        });
      if (!items.length) return null;
      return `    <div class="book-section">
      <h2 class="genre-heading">${escapeHtml(category || "Other")}</h2>
      <ul class="book-list">
${items.join("\n")}
      </ul>
    </div>`;
    })
    .filter(Boolean)
    .join("\n\n");
}

function updateIndex(collection, entries) {
  const c = collections[collection];
  const indexPath = path.join(root, c.index);
  const html = fs.readFileSync(indexPath, "utf8");
  const start = `<!-- ${c.marker}:START -->`;
  const end = `<!-- ${c.marker}:END -->`;
  const startIdx = html.indexOf(start);
  const endIdx = html.indexOf(end);
  if (startIdx === -1 || endIdx === -1) {
    throw new Error(`${c.index} is missing ${c.marker}:START/${c.marker}:END markers`);
  }
  const render = c.shelf ? renderShelf : renderList;
  const list = entries.length ? `\n${render(collection, entries)}` : "";
  const updated = `${html.slice(0, startIdx + start.length)}${list}\n    ${html.slice(endIdx)}`;
  fs.writeFileSync(indexPath, updated);
}

function escapeXml(str) {
  return str.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]));
}

function buildFeed(posts) {
  const items = posts
    .map(
      (post) => `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${SITE_URL}/${post.slug}.html</link>
      <guid>${SITE_URL}/${post.slug}.html</guid>
      <pubDate>${post.date.toUTCString()}</pubDate>
      <description>${escapeXml(marked.parse(post.body))}</description>
    </item>`
    )
    .join("\n");

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${SITE_TITLE}</title>
    <link>${SITE_URL}</link>
    <description>Writing by Divith Narendra</description>
${items}
  </channel>
</rss>
`;
  fs.writeFileSync(feedPath, feed);
}

// Renders every published entry and refreshes the index lists and feed.
// A draft gets no page, and its old page is removed if it was published before.
export function build() {
  const counts = [];
  for (const collection of Object.keys(collections)) {
    const c = collections[collection];
    const entries = loadEntries(collection);
    const live = entries.filter((e) => !e.draft);

    for (const entry of entries) {
      const outPath = path.join(root, c.out(entry.slug));
      if (entry.draft) fs.rmSync(outPath, { force: true });
      else fs.writeFileSync(outPath, renderPage(collection, entry));
    }

    updateIndex(collection, live);
    if (collection === "posts") buildFeed(live);
    counts.push(`${live.length} ${c.label}`);
  }
  console.log(`Built ${counts.join(", ")}; updated index pages and feed.xml`);
}

if (import.meta.main) build();
