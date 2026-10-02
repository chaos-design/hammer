/**
 * Next.js applies `basePath` to `next/link`, `next/image`, the router and the
 * `_next` bundle. It does **not** rewrite absolute paths written by hand:
 *
 *   - plain `<img src="/logo.png">`
 *   - CSS `url(/bg.png)`
 *   - frontmatter strings such as `preview: "/card.png"`
 *   - metadata URLs (`og:image`, canonicals)
 *
 * GitHub Pages serves a project site from `https://<owner>.github.io/<repo>/`,
 * so every one of those has to be prefixed explicitly or it 404s.
 *
 * `next.config.ts` imports `basePath` and also exports it as
 * `NEXT_PUBLIC_BASE_PATH`, because only `NEXT_PUBLIC_*` variables are inlined
 * into the client bundle.
 */
const isGitHubPages = process.env.DEPLOY_TARGET === 'github';

const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'hammer';

const computed = isGitHubPages ? `/${repoName}` : '';

const raw = process.env.NEXT_PUBLIC_BASE_PATH ?? computed;

/** `''` in development, `'/hammer'` when deploying to GitHub Pages. */
export const basePath = raw.replace(/\/+$/, '');

/**
 * Prefix a site-root-absolute path with {@link basePath}.
 *
 * Already-prefixed paths, external URLs, protocol-relative URLs, `data:` URIs
 * and fragments are returned unchanged, so it is safe to call on a value of
 * unknown origin.
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
