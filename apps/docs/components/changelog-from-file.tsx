import fs from "node:fs/promises";
import path from "node:path";
import ReactMarkdown from "react-markdown";
import { ChangelogEntry } from "./changelog-entry";

type ChangelogFromFileProps = {
  path: string;
};

type ChangelogSection = {
  title: string;
  version?: string;
  date?: string;
  bodyLines: string[];
};

function parseHeader(header: string) {
  const normalized = header.trim();
  
  // Match "0.0.22 2026-01-31"
  const newFormatMatch = /^(\S+)\s+(\d{4}-\d{2}-\d{2})$/.exec(normalized);
  if (newFormatMatch) {
    return {
      title: normalized,
      version: newFormatMatch[1],
      date: newFormatMatch[2],
    };
  }

  const cleanHeader = normalized.replace(/^\[|\]$/g, "");
  const match =
    /^([^-]+?)(?:\s*-\s*(.+))?$/.exec(cleanHeader);
  const version = match?.[1]?.trim();
  const date = match?.[2]?.trim();
  return {
    title: cleanHeader,
    version,
    date,
  };
}

function parseSections(content: string): ChangelogSection[] {
  const sections = content
    .split(/^##\s+/m)
    .map((section) => section.trim())
    .filter(Boolean);

  return sections.map((section) => {
    const [rawHeader, ...rest] = section.split("\n");
    const { title, version, date } = parseHeader(rawHeader ?? "");
    return {
      title,
      version,
      date,
      bodyLines: rest,
    };
  });
}

export async function ChangelogFromFile({ path: filePath }: ChangelogFromFileProps) {
  const resolvedPath = path.isAbsolute(filePath)
    ? filePath
    : path.resolve(process.cwd(), filePath);
  let content = "";
  try {
    content = await fs.readFile(resolvedPath, "utf8");
  } catch {
    return (
      <div className="text-sm text-foreground/70">
        未找到 Changelog 文件：{resolvedPath}
      </div>
    );
  }

  const sections = parseSections(content);

  if (sections.length === 0) {
    return null;
  }

  return (
    <div className="space-y-10">
      {sections.filter(item => item?.date).map((section, index) => (
        <ChangelogEntry
          key={`${section.title}-${index}`}
          date={section.date ?? "未提供日期"}
          version={section.version}
          title={section.title}
        >
          <div className="prose dark:prose-invert prose-sm">
            <ReactMarkdown>{section.bodyLines.join("\n")}</ReactMarkdown>
          </div>
        </ChangelogEntry>
      ))}
    </div>
  );
}
