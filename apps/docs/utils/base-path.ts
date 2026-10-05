/**
 * Where the docs site is served from, and how to build URLs for it.
 *
 * Next.js applies `basePath` to `next/link`, `next/image`, the router and the
 * `_next` bundle. It does **not** rewrite absolute paths written by hand:
 *
 *   - plain `<img src="/logo.png">`
 *   - CSS `url(/bg.png)`
 *   - `NavigationMenu.Link href="/x"` (a plain anchor, not `next/link`)
 *   - metadata URLs, which Next joins onto `metadataBase.pathname`
 *
 * So the prefix has to be applied explicitly at those call sites.
 *
 * Two independent concerns live here, and conflating them breaks deployments:
 *
 *   - **`basePath`** — where the app is *served from*. GitHub Pages project
 *     sites are served from `/<repo>/`, so assets need the prefix. A custom
 *     domain (or Vercel, or `next dev`) is served from the root, so
 *     `basePath` is empty.
 *   - **canonical URL** — what metadata advertises. This is the address users
 *     actually visit, and what `og:image` must resolve against.
 *
 * `SITE_URL` sets the canonical URL only. The GitHub Pages export keeps working
 * with its `/hammer` prefix while social previews point at the real domain.
 *
 * `next.config.ts` imports `basePath` from here and re-exports it as
 * `NEXT_PUBLIC_BASE_PATH`, because only `NEXT_PUBLIC_*` variables are inlined
 * into the client bundle.
 */

/** The address users visit. Set `SITE_URL` for the custom domain. */
export const siteUrl = (
  process.env.SITE_URL ??
  process.env.NEXT_PUBLIC_SITE_URL ??
  ''
)
  .trim()
  .replace(/\/+$/, '');

/**
 * `'/<repo>'` on GitHub Pages, `''` everywhere else.
 *
 * Derived from the deploy target alone — never from `SITE_URL`, otherwise
 * pointing the canonical URL at a custom domain would silently strip the
 * prefix that the GitHub Pages export needs.
 */
export const basePath =
  process.env.DEPLOY_TARGET === 'github'
    ? `/${process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'hammer'}`
    : '';

/**
 * The origin for `metadataBase`.
 *
 * Never `localhost` in a deployed build: `metadataBase` is what turns a
 * relative image path into an absolute `og:image`, so a localhost value makes
 * every shared link render without a preview.
 */
export const canonicalUrl =
  siteUrl ||
  (basePath && process.env.GITHUB_REPOSITORY
    ? `https://${process.env.GITHUB_REPOSITORY.split('/')[0]}.github.io${basePath}`
    : 'http://localhost:3460');

/**
 * Prefix a site-root-absolute path with {@link basePath}.
 *
 * A no-op when there is no basePath, so the same call site works on every
 * deployment target. Already-prefixed paths, external URLs, protocol-relative
 * URLs, `data:` URIs and fragments are returned unchanged, which makes it safe
 * to call on a value of unknown origin.
 */
export function withBasePath(path: string): string {
  if (!path) return path;

  // Absolute URL (`https:`, `mailto:`, `data:`), protocol-relative or anchor.
  if (/^[a-z][a-z\d+\-.]*:/i.test(path) || path.startsWith('//')) return path;
  if (path.startsWith('#')) return path;
  if (!basePath) return path;

  const normalised = path.startsWith('/') ? path : `/${path}`;

  // Idempotent: do not double-prefix.
  if (normalised === basePath || normalised.startsWith(`${basePath}/`)) {
    return normalised;
  }

  return `${basePath}${normalised}`;
}

/**
 * A site path as an absolute URL on the canonical origin.
 *
 * For the files that are fetched *instead of* a page — `sitemap.xml`,
 * `/llms.txt`, OpenGraph URLs — rather than rendered as one. They carry no
 * `basePath`: they advertise the address the site is canonical at, which is the
 * same origin `metadataBase` uses. A sitemap advertising a different host than
 * every `rel=canonical` on the site is a contradiction a crawler acts on.
 *
 * The canonical origin can itself carry a path (`https://<user>.github.io/<repo>`,
 * what a GitHub Pages export falls back to without `SITE_URL`), and `new URL()`
 * against a base *discards* that path. It is joined back on here, because an
 * index that names an address the site does not serve is worse than no index:
 * the links are absolute, so nothing else corrects them.
 *
 * The input is a site-root-relative path without `basePath` (`page.url`,
 * `/llms.txt`), exactly like {@link withBasePath}.
 */
export function absoluteUrl(path: string): string {
  const origin = new URL(canonicalUrl);
  const prefix = origin.pathname.replace(/\/$/, '');
  const suffix = path.startsWith('/') ? path : `/${path}`;

  return new URL(`${prefix}${suffix}`, origin).toString();
}
