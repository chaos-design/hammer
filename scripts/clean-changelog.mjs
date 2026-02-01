import { readFile, writeFile } from "node:fs/promises";

const filePath = new URL("../CHANGELOG.md", import.meta.url);
const raw = await readFile(filePath, "utf8");
const lines = raw.split(/\r?\n/);

const intro = [];
const sections = [];

let currentHeader = null;
let currentBody = [];

const normalizeHeader = (header) => {
  const match = header.match(
    /^##\s+\[?([^\]\s]+)\]?(?:\([^)]+\))?\s*\((\d{4}-\d{2}-\d{2})\)/
  );
  if (match) {
    return `## ${match[1]} ${match[2]}`;
  }
  return header;
};

for (const line of lines) {
  if (/^##\s/.test(line)) {
    if (currentHeader) {
      sections.push({ header: currentHeader, body: currentBody });
    } else if (intro.length > 0) {
      sections.push({ header: null, body: intro.splice(0) });
    }
    currentHeader = normalizeHeader(line);
    currentBody = [];
  } else if (currentHeader) {
    currentBody.push(line);
  } else {
    intro.push(line);
  }
}

if (currentHeader) {
  sections.push({ header: currentHeader, body: currentBody });
} else if (intro.length > 0) {
  sections.push({ header: null, body: intro });
}

const cleaned = [];

for (const section of sections) {
  if (!section.header) {
    cleaned.push(...section.body);
    continue;
  }
  const hasContent = section.body.some((line) => {
    const trimmed = line.trim();
    if (!trimmed) return false;
    if (/^###\s/.test(trimmed)) return false;
    return true;
  });
  if (hasContent) {
    cleaned.push(section.header, ...section.body);
  }
}

const output = `${cleaned.join("\n").replace(/\s+$/u, "")}\n`;
await writeFile(filePath, output, "utf8");
