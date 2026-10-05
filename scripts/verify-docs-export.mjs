/**
 * Verify the exported docs site: language parity, transfer budgets, and the
 * links the LLM index advertises.
 *
 * The site is exported as static files, so the only runtime cost a reader
 * pays is the bytes fetched. Two things can silently break that, and neither
 * shows up as a build error:
 *
 *   - **A page that exists in one language only.** `content/docs/**` is
 *     authored as `x.mdx` plus `x.en.mdx`; forgetting the twin produces a
 *     404 under `/en/**` and drops that URL out of the `hreflang` group,
 *     quietly. Nothing else notices.
 *   - **The two route trees drifting apart.** They render the same React
 *     components and must therefore share one client bundle. A `use client`
 *     boundary placed wrongly, or a server value stringified into a client
 *     prop per tree, ships the bundle twice — the build stays green and
 *     every reader pays for it.
 *
 * A third is the opposite failure: `/llms.txt` is nothing but a list of
 * absolute URLs handed to a model that will believe them, so a link to a path
 * the export does not ship is a promise the site cannot keep, and no reader
 * ever finds out.
 *
 * All are asserted here, against the artifact that actually ships, after
 * the docs build. Run from the repository root:
 *
 *   node scripts/verify-docs-export.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';

const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const outDir = path.join(rootDir, 'apps/docs/out');

/**
 * Per-page transfer budgets, gzip-compressed, measured across the whole
 * export rather than sampled from one page.
 *
 * These are regression guards, not targets. The current figures are ~404 KB
 * of JS, ~33 KB of CSS and ~25 KB of HTML on a documentation page; the
 * budgets leave roughly 10% of headroom for deliberate dependency work.
 * Raise them in the same commit that earns it, so the number stays a
 * decision rather than a ratchet nobody questions.
 */
const BUDGETS = {
  js: 450 * 1024,
  css: 40 * 1024,
  html: 40 * 1024,
};

/**
 * How much heavier an English page may be than its Chinese counterpart.
 *
 * The two trees must cost the *same*; the small allowance absorbs Next
 * hashing a marginally different chunk per route. A tree that ships extra
 * JavaScript blows straight through this.
 */
const EN_OVER_ZH_TOLERANCE = 1.05;

/** URL prefixes of the two documentation trees inside the export. */
const TREES = { zh: 'docs', en: 'en/docs' };

const ASSET_REF = /["']([^"']*_next\/static\/[^"']+\.(?:js|css))["']/g;

/**
 * Any CJK ideograph. Used to catch a language that leaked into a field that
 * has no business holding one.
 */
const CJK = /[一-鿿]/;

const errors = [];
const warnings = [];

if (!fs.existsSync(outDir)) {
  console.error(
    'docs export not found at apps/docs/out.\n' +
      'Build it first: pnpm --filter @chaos-design/hammer-docs run build',
  );
  process.exit(1);
}

const gzipSize = (file) => zlib.gzipSync(fs.readFileSync(file)).length;

/** Every exported HTML file, as `{ url, file, html }`. */
const readPages = (dir = outDir, found = []) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const entryPath = path.join(dir, entry.name);

    if (entry.isDirectory()) readPages(entryPath, found);
    else if (entry.name.endsWith('.html')) found.push(entryPath);
  }

  return found;
};

/**
 * Site URL of an exported HTML file, matching what `page.url` looks like on
 * the loader side: no `basePath`, no `index.html`, no trailing slash (the
 * export writes `trailingSlash: true`, but that is a filesystem concern).
 */
const urlOf = (file) => {
  const relative = path.relative(outDir, file).split(path.sep).join('/');
  const trimmed = relative.replace(/index\.html$/, '').replace(/\.html$/, '');

  return `/${trimmed}`.replace(/(.)\/$/, '$1');
};

/**
 * Resolve a site-root asset reference to a file in the export.
 *
 * The reference carries the deployment `basePath` (`/hammer/_next/...` on
 * GitHub Pages, `/_next/...` elsewhere); the export stores it unprefixed.
 */
const resolveAsset = (ref) =>
  path.join(outDir, ref.slice(ref.indexOf('_next/')));

const pages = readPages().map((file) => {
  const html = fs.readFileSync(file, 'utf8');
  const url = urlOf(file);

  const scripts = new Set();
  const styles = new Set();

  for (const [, ref] of html.matchAll(ASSET_REF)) {
    (ref.endsWith('.js') ? scripts : styles).add(ref);
  }

  const bytes = (refs) => {
    let total = 0;

    for (const ref of refs) {
      const asset = resolveAsset(ref);

      if (!fs.existsSync(asset)) {
        errors.push(`${url}: references a missing asset ${ref}`);
        continue;
      }

      total += gzipSize(asset);
    }

    return total;
  };

  return {
    url,
    file,
    scripts,
    html,
    js: bytes(scripts),
    css: bytes(styles),
    htmlBytes: gzipSize(file),
  };
});

/* -------------------------------------------------------------------------- */
/* The document says what language it is                                        */
/* -------------------------------------------------------------------------- */

/**
 * `<html lang>` must name the page's language, in the HTML itself.
 *
 * The site has one root layout per language rather than a single
 * `app/layout.tsx`, which is what lets the attribute be rendered on the server.
 * Patching it from the client instead — the other way to do this — leaves every
 * crawler and every no-JS reader looking at the wrong language until hydration
 * finishes, so this assertion exists to keep someone from "simplifying" the two
 * root layouts back into one.
 *
 * `404.html` is exempt: it is emitted by Next for URLs that match no route, and
 * it is rendered above every root layout. See `app/not-found.tsx`.
 */
const GLOBAL_404 = new Set(['/404', '/_not-found']);

for (const page of pages) {
  if (GLOBAL_404.has(page.url)) continue;

  const expected = page.url.startsWith('/en') ? 'en' : 'zh-CN';
  const [, declared] = page.html.match(/<html[^>]*\slang="([^"]*)"/) ?? [];

  if (declared !== expected) {
    errors.push(
      `${page.url}: <html lang> is ${declared ? `"${declared}"` : 'missing'}, ` +
        `expected "${expected}"`,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* Metadata speaks its own page's language                                      */
/* -------------------------------------------------------------------------- */

/**
 * The metadata of an English page must be English.
 *
 * The root layout is shared by both trees and describes the Chinese site, so
 * any field a page forgets to restate silently inherits Chinese — into the
 * `description`, and from there into every link preview. Unlike the rendered
 * body, where Chinese can be legitimate (demo seed data, the changelog), a
 * Chinese `og:description` on an English URL is never right, so this one fails
 * the build rather than warning.
 */
const META_TAGS =
  /<meta[^>]+(?:name|property)="(description|og:description|twitter:description)"[^>]+content="([^"]*)"/g;

for (const page of pages) {
  if (!page.url.startsWith('/en')) continue;

  for (const [, name, content] of page.html.matchAll(META_TAGS)) {
    if (CJK.test(content))
      errors.push(`${page.url}: ${name} is not in English — "${content}"`);
  }
}

/* -------------------------------------------------------------------------- */
/* Transfer budgets                                                           */
/* -------------------------------------------------------------------------- */

for (const page of pages) {
  const weight = {
    js: page.js,
    css: page.css,
    html: page.htmlBytes,
  };

  for (const [label, limit] of Object.entries(BUDGETS)) {
    if (weight[label] > limit) {
      errors.push(
        `${page.url}: ${label} is ${Math.round(weight[label] / 1024)} KB, ` +
          `over the ${Math.round(limit / 1024)} KB budget`,
      );
    }
  }
}

/* -------------------------------------------------------------------------- */
/* Language parity                                                            */
/* -------------------------------------------------------------------------- */

/**
 * The documentation pages of one tree, keyed by the slug the two trees share
 * — the content path, without the locale prefix. Holding the pages themselves
 * (rather than their URLs) keeps every later comparison free of string
 * surgery, including the empty slug of `/docs` and `/en/docs`.
 */
const treeOf = (prefix) => {
  const bySlug = new Map();

  for (const page of pages) {
    if (page.url.startsWith(`/${prefix}/`))
      bySlug.set(page.url.slice(prefix.length + 2), page);
    else if (page.url === `/${prefix}`) bySlug.set('', page);
  }

  return bySlug;
};

const trees = { zh: treeOf(TREES.zh), en: treeOf(TREES.en) };

for (const [language, other, label] of [
  ['zh', 'en', 'English'],
  ['en', 'zh', 'Chinese'],
]) {
  for (const [slug, page] of [...trees[language]].sort()) {
    if (!trees[other].has(slug))
      errors.push(`${page.url} has no ${label} counterpart in the export`);
  }
}

// The entry pages are authored by hand rather than derived from content
// files, so a missing or renamed one is just as silent as a missing twin.
for (const entry of ['/', '/en', `/${TREES.zh}`, `/${TREES.en}`]) {
  if (!pages.some((page) => page.url === entry))
    errors.push(`missing entry page ${entry}`);
}

/* -------------------------------------------------------------------------- */
/* Every link the llms.txt index advertises resolves                          */
/* -------------------------------------------------------------------------- */

/**
 * `/llms.txt` is generated from the page tree, so a link in it can only be
 * wrong if the mapping from a page to its markdown URL is — which is exactly
 * what a model cannot detect: it fetches the index, picks a link, and gets a
 * 404 it has no reason to doubt. Resolved against the export, because that is
 * the artifact the deployment serves.
 */
const LLMS_FILE = 'llms.txt';
const llmsPath = path.join(outDir, LLMS_FILE);

if (!fs.existsSync(llmsPath)) {
  errors.push(`${LLMS_FILE} was not exported`);
} else {
  const llms = fs.readFileSync(llmsPath, 'utf8');

  // The format's one required element: a single H1 naming the site.
  if (!/^# \S/m.test(llms))
    errors.push(`${LLMS_FILE} has no "# " title on a line of its own`);

  const links = [];

  for (const [, href] of llms.matchAll(/\]\(([^)\s]+)\)/g)) {
    let link;

    try {
      link = new URL(href);
    } catch {
      // A relative link resolves against whatever page the reader was on,
      // which for a model means a link it cannot follow at all.
      errors.push(`${LLMS_FILE} link is not absolute: ${href}`);
      continue;
    }

    // The dev server baked into a deployed index; `deploy-docs.yml` asserts the
    // same thing for the metadata tags, where it is just as invisible.
    if (/(^|\/\/)(localhost|127\.0\.0\.1)/.test(link.origin))
      errors.push(`${LLMS_FILE} link points at the dev server: ${href}`);

    links.push(link);
  }

  const origins = new Set(links.map((link) => link.origin));

  if (origins.size > 1)
    errors.push(
      `${LLMS_FILE} advertises ${origins.size} origins — every link in it ` +
        `must be a page of this site: ${[...origins].join(', ')}`,
    );

  /**
   * The origin is read back out of the index rather than from `SITE_URL`:
   * building and verifying are separate steps in `deploy-docs.yml`, so the
   * environment that produced the file is not the one inspecting it. A
   * canonical origin may itself carry a path
   * (`https://<user>.github.io/<repo>`), which the export stores without.
   */
  const prefix = new URL(
    links[0]?.origin ?? 'http://localhost',
  ).pathname.replace(/\/+$/, '');

  for (const link of links) {
    const pathname = link.pathname.startsWith(prefix)
      ? link.pathname.slice(prefix.length)
      : link.pathname;

    if (!fs.existsSync(path.join(outDir, pathname)))
      errors.push(
        `${LLMS_FILE} links ${link.href}, which the export does not ship`,
      );
  }
}

/* -------------------------------------------------------------------------- */
/* One bundle, two trees                                                      */
/* -------------------------------------------------------------------------- */

for (const [slug, zh] of [...trees.zh].sort()) {
  const en = trees.en.get(slug);

  if (!en) continue;

  const sameScripts =
    [...zh.scripts].every((ref) => en.scripts.has(ref)) &&
    [...en.scripts].every((ref) => zh.scripts.has(ref));

  if (!sameScripts) {
    errors.push(
      `${zh.url} and ${en.url} load different JavaScript chunks — the two ` +
        'route trees must share one client bundle',
    );
  }

  if (en.js > zh.js * EN_OVER_ZH_TOLERANCE) {
    errors.push(
      `${en.url} ships ${Math.round(en.js / 1024)} KB of JS against ` +
        `${Math.round(zh.js / 1024)} KB for its Chinese counterpart`,
    );
  }
}

/* -------------------------------------------------------------------------- */

for (const warning of warnings) console.warn(`warn: ${warning}`);

if (errors.length > 0) {
  console.error('\nDocs export verification failed:\n');
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

const heaviest = pages.reduce((a, b) => (a.js > b.js ? a : b));
console.log(
  `Docs export verified: ${pages.length} page(s), ` +
    `${trees.zh.size} per language tree, heaviest ${heaviest.url} at ` +
    `${Math.round(heaviest.js / 1024)} KB JS (gzip).`,
);
