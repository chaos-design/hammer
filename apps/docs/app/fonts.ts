import localFont from 'next/font/local';

/**
 * Fonts are self-hosted rather than pulled from `next/font/google`.
 *
 * `next/font/google` fetches the font files from Google's CDN during the build,
 * so a network hiccup or a Google-side rate limit fails the entire deployment.
 * Vendoring the woff2 files makes the build hermetic and repeatable.
 *
 * Only the `latin` subset is vendored, matching the previous
 * `subsets: ['latin']` configuration — CJK glyphs continue to resolve through
 * the system font stack declared in `global.css`.
 *
 * Both families are licensed under the SIL Open Font License 1.1.
 */

// Inter ships as a variable font covering the full 100..900 weight axis.
export const inter = localFont({
  src: './fonts/inter-latin.woff2',
  style: 'normal',
  weight: '100 900',
  display: 'swap',
  variable: '--font-inter',
});

export const poppins = localFont({
  src: [
    { path: './fonts/poppins-400-latin.woff2', weight: '400', style: 'normal' },
    { path: './fonts/poppins-500-latin.woff2', weight: '500', style: 'normal' },
    { path: './fonts/poppins-600-latin.woff2', weight: '600', style: 'normal' },
    { path: './fonts/poppins-700-latin.woff2', weight: '700', style: 'normal' },
    { path: './fonts/poppins-800-latin.woff2', weight: '800', style: 'normal' },
    { path: './fonts/poppins-900-latin.woff2', weight: '900', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-poppins',
});
