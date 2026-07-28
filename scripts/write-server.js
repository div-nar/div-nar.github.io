import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { execFileSync, exec } from "node:child_process";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const postsDir = path.join(root, "posts");
const formPath = path.join(root, "scripts", "write.html");
const PORT = 5566;

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isoDate(value) {
  const date = value instanceof Date ? value : new Date(value);
  return date.toISOString().slice(0, 10);
}

function listPosts() {
  return fs
    .readdirSync(postsDir)
    .filter((f) => f.endsWith(".md"))
    .map((file) => {
      const slug = path.basename(file, ".md");
      const { data } = matter(fs.readFileSync(path.join(postsDir, file), "utf8"));
      return { slug, title: data.title, date: isoDate(data.date) };
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

function readPost(slug) {
  const filePath = path.join(postsDir, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  const { data, content } = matter(fs.readFileSync(filePath, "utf8"));
  return { slug, title: data.title, date: isoDate(data.date), body: content.trim() };
}

function writePost({ slug, title, date, body }) {
  const frontmatter = `---\ntitle: ${title}\ndate: ${date}\n---\n`;
  fs.writeFileSync(path.join(postsDir, `${slug}.md`), `${frontmatter}${body.trim()}\n`);
}

function runBuild() {
  execFileSync("node", [path.join(root, "scripts", "build.js")], { cwd: root, stdio: "inherit" });
}

function sendJson(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
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

    if (req.method === "GET" && url.pathname === "/") {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(fs.readFileSync(formPath, "utf8"));
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/posts") {
      sendJson(res, 200, listPosts());
      return;
    }

    if (req.method === "GET" && url.pathname.startsWith("/api/posts/")) {
      const slug = url.pathname.split("/").pop();
      const post = readPost(slug);
      if (!post) return sendJson(res, 404, { error: "not found" });
      sendJson(res, 200, post);
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/posts") {
      const payload = JSON.parse(await readBody(req));
      const title = (payload.title || "").trim();
      const body = (payload.body || "").trim();
      const date = payload.date || new Date().toISOString().slice(0, 10);
      if (!title || !body) return sendJson(res, 400, { error: "title and body are required" });

      const slug = payload.slug || slugify(title);
      writePost({ slug, title, date, body });
      runBuild();
      sendJson(res, 200, { slug, url: `/${slug}.html` });
      return;
    }

    if (req.method === "GET") {
      serveStatic(res, url.pathname);
      return;
    }

    res.writeHead(404);
    res.end("not found");
  } catch (err) {
    sendJson(res, 500, { error: err.message });
  }
});

server.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  console.log(`Write UI running at ${url}`);
  const opener = process.platform === "darwin" ? "open" : process.platform === "win32" ? "start" : "xdg-open";
  exec(`${opener} ${url}`);
});
