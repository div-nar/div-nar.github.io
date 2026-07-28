import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import { marked } from "marked";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const postsDir = path.join(root, "posts");
const templatePath = path.join(root, "templates", "post.html");
const indexPath = path.join(root, "index.html");
const feedPath = path.join(root, "feed.xml");

const SITE_URL = "https://div-nar.github.io";
const SITE_TITLE = "Divith Narendra";

function readingTimeLabel(text) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 150));
  return `${minutes} minute${minutes === 1 ? "" : "s"} read`;
}

function displayDate(date) {
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
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

function loadPosts() {
  const files = fs.readdirSync(postsDir).filter((f) => f.endsWith(".md"));
  return files.map((file) => {
    const slug = path.basename(file, ".md");
    const raw = fs.readFileSync(path.join(postsDir, file), "utf8");
    const { data, content } = matter(raw);
    if (!data.title || !data.date) {
      throw new Error(`${file}: frontmatter needs "title" and "date"`);
    }
    return {
      slug,
      title: data.title,
      date: new Date(data.date),
      body: content,
    };
  });
}

function renderPost(post, template) {
  const bodyHtml = indentBody(marked.parse(post.body));
  return template
    .replaceAll("{{title}}", post.title)
    .replaceAll("{{displayDate}}", displayDate(post.date))
    .replaceAll("{{readingTimeLabel}}", readingTimeLabel(post.body))
    .replace("{{body}}", bodyHtml);
}

function renderIndexList(posts) {
  const byYear = new Map();
  for (const post of posts) {
    const year = post.date.getFullYear();
    if (!byYear.has(year)) byYear.set(year, []);
    byYear.get(year).push(post);
  }
  const years = [...byYear.keys()].sort((a, b) => b - a);

  const groups = years.map((year) => {
    const yearPosts = byYear.get(year).sort((a, b) => a.date - b.date);
    const items = yearPosts
      .map(
        (post) => `        <li class="post-item">
          <a href="${post.slug}.html" class="post-title">${post.title}</a>
          <p class="post-meta">${readingTimeLabel(post.body)} · ${displayDate(post.date)}</p>
        </li>`
      )
      .join("\n");
    return `    <div class="year-group">
      <p class="year-heading">${year}</p>
      <ul class="post-list">
${items}
      </ul>
    </div>`;
  });

  return groups.join("\n");
}

function updateIndex(posts) {
  const html = fs.readFileSync(indexPath, "utf8");
  const start = "<!-- POSTS:START -->";
  const end = "<!-- POSTS:END -->";
  const startIdx = html.indexOf(start);
  const endIdx = html.indexOf(end);
  if (startIdx === -1 || endIdx === -1) {
    throw new Error("index.html is missing POSTS:START/POSTS:END markers");
  }
  const before = html.slice(0, startIdx + start.length);
  const after = html.slice(endIdx);
  const updated = `${before}\n${renderIndexList(posts)}\n    ${after}`;
  fs.writeFileSync(indexPath, updated);
}

function escapeXml(str) {
  return str.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]));
}

function buildFeed(posts) {
  const sorted = [...posts].sort((a, b) => b.date - a.date);
  const items = sorted
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

function main() {
  const posts = loadPosts();
  const template = fs.readFileSync(templatePath, "utf8");

  for (const post of posts) {
    const html = renderPost(post, template);
    fs.writeFileSync(path.join(root, `${post.slug}.html`), html);
  }

  updateIndex(posts);
  buildFeed(posts);

  console.log(`Built ${posts.length} post(s), updated index.html and feed.xml`);
}

main();
