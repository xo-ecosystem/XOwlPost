import fs from "fs";
import path from "path";

const title = process.argv.slice(2).join(" ");
if (!title) {
  console.error("Usage: pnpm new:post \"Post Title\"");
  process.exit(1);
}

const slug = title
  .toLowerCase()
  .replace(/[^a-z0-9\s-]/g, "")
  .replace(/\s+/g, "-");

const today = new Date().toISOString().split("T")[0];

const content = `---
title: "${title}"
description: ""
pubDate: "${today}"
draft: true
vault_url: ""
ledger_day: "${today}"
digest_day: "${today}"
---

Write here.
`;

const filePath = path.join("src/content/blog", `${slug}.md`);

if (fs.existsSync(filePath)) {
  console.error("File already exists.");
  process.exit(1);
}

fs.writeFileSync(filePath, content);
console.log("Created:", filePath);
