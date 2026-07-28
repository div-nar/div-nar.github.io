import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const postsDir = path.join(root, "posts");

const title = process.argv.slice(2).join(" ").trim();
if (!title) {
  console.error('Usage: npm run new -- "Post Title"');
  process.exit(1);
}

const slug = title
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "");

const filePath = path.join(postsDir, `${slug}.md`);
if (fs.existsSync(filePath)) {
  console.error(`${filePath} already exists`);
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);
const content = `---
title: ${title}
date: ${today}
---
`;

fs.writeFileSync(filePath, content);
console.log(`Created ${path.relative(root, filePath)}`);
