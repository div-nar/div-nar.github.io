import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { execFileSync, exec } from "node:child_process";
import matter from "gray-matter";
import { root, collections, build, loadEntries, readEntry, renderPage, slugify, isoDate } from "./build.js";

const formPath = path.join(root, "scripts", "write.html");
const PORT = 5566;
const SITE_URL = "https://div-nar.github.io";
// GitHub Pages serves main, so Publish only pushes from there.
const PUBLISH_BRANCH = "main";

function toJson(entry) {
  const { body, date, ...rest } = entry;
  return { ...rest, date: isoDate(date), body: body.trim() };
}

function writeEntry(collection, slug, fields) {
  const data = { title: fields.title, date: fields.date };
  for (const key of ["type", "where", "rating"]) {
    if (fields[key]) data[key] = fields[key];
  }
  if (fields.draft) data.draft = true;
  const dir = path.join(root, collections[collection].dir);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${slug}.md`), matter.stringify(`${fields.body}\n`, data));
}

function git(args) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
}

// Commits only the files this entry touches, so other work in the tree stays out.
function publish(collection, slug) {
  const branch = git(["rev-parse", "--abbrev-ref", "HEAD"]);
  if (branch !== PUBLISH_BRANCH) {
    throw new Error(`Publishing pushes ${PUBLISH_BRANCH}, but this checkout is on "${branch}". Switch to ${PUBLISH_BRANCH} first.`);
  }
  const entry = readEntry(collection, slug);
  if (!entry) throw new Error("Save the entry before publishing");

  const c = collections[collection];
  const tracked = new Set(git(["ls-files"]).split("\n"));
  const paths = [`${c.dir}/${slug}.md`, c.out(slug), c.index, "feed.xml"].filter(
    (p) => tracked.has(p) || fs.existsSync(path.join(root, p))
  );
  git(["add", "-A", "--", ...paths]);
  if (!git(["diff", "--cached", "--name-only", "--", ...paths])) {
    return { message: "Nothing new to publish" };
  }
  const verb = entry.draft ? "Unpublish" : "Publish";
  git(["commit", "-m", `${verb}: ${entry.title}`, "--", ...paths]);
  git(["push", "origin", PUBLISH_BRANCH]);
  return { message: entry.draft ? "Unpublished" : "Published", liveUrl: entry.draft ? null : `${SITE_URL}/${c.out(slug)}` };
}

function sendJson(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

function sendHtml(res, html) {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(html);
}

const MIME_TYPES = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".xml": "application/xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
};

function serveStatic(res, pathname) {
  const filePath = path.join(root, pathname);
  if (!filePath.startsWith(root) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404);
    res.end("not found");
    return;
  }
  const ext = path.extname(filePath);
  res.writeHead(200, { "Content-Type": MIME_TYPES[ext] || "application/octet-stream" });
  fs.createReadStream(filePath).pipe(res);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let chunks = "";
    req.on("data", (c) => (chunks += c));
    req.on("end", () => resolve(chunks));
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    // /api/<collection>[/<slug>] and /preview/<collection>/<slug>
    const [, area, collection, rawSlug] = url.pathname.split("/");
    const slug = rawSlug ? slugify(rawSlug) : null;

    if (req.method === "GET" && url.pathname === "/") {
      return sendHtml(res, fs.readFileSync(formPath, "utf8"));
    }

    if (req.method === "POST" && url.pathname === "/api/publish") {
      const payload = JSON.parse(await readBody(req));
      if (!collections[payload.collection]) return sendJson(res, 404, { error: "unknown section" });
      return sendJson(res, 200, publish(payload.collection, slugify(payload.slug || "")));
    }

    if (area === "preview" && collections[collection] && slug) {
      const entry = readEntry(collection, slug);
      if (!entry) return sendJson(res, 404, { error: "not found" });
      return sendHtml(res, renderPage(collection, entry));
    }

    if (area === "api" && collections[collection]) {
      if (req.method === "GET" && !slug) {
        return sendJson(res, 200, loadEntries(collection).map(({ slug, title, draft }) => ({ slug, title, draft })));
      }

      if (req.method === "GET") {
        const entry = readEntry(collection, slug);
        if (!entry) return sendJson(res, 404, { error: "not found" });
        return sendJson(res, 200, toJson(entry));
      }

      if (req.method === "POST") {
        const payload = JSON.parse(await readBody(req));
        const title = (payload.title || "").trim();
        const body = (payload.body || "").trim();
        if (!title || !body) return sendJson(res, 400, { error: "Title and body are required" });

        const entrySlug = slugify(payload.slug || title);
        if (!entrySlug) return sendJson(res, 400, { error: "Title needs at least one letter or number" });
        writeEntry(collection, entrySlug, {
          title,
          body,
          date: payload.date || isoDate(new Date()),
          type: (payload.type || "").trim(),
          where: (payload.where || "").trim(),
          rating: (payload.rating || "").trim(),
          draft: Boolean(payload.draft),
        });
        build();
        return sendJson(res, 200, { slug: entrySlug });
      }
    }

    if (req.method === "GET") return serveStatic(res, url.pathname);

    res.writeHead(404);
    res.end("not found");
  } catch (err) {
    sendJson(res, 500, { error: err.stderr?.toString().trim() || err.message });
  }
});

// Loopback only: this server writes files and can push to GitHub.
server.listen(PORT, "127.0.0.1", () => {
  const url = `http://localhost:${PORT}`;
  console.log(`Write UI running at ${url}`);
  if (process.env.NO_OPEN) return;
  const opener = process.platform === "darwin" ? "open" : process.platform === "win32" ? "start" : "xdg-open";
  exec(`${opener} ${url}`);
});
