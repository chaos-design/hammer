import path from 'node:path';
import withBundleAnalyzer from '@next/bundle-analyzer';
import { createMDX } from 'fumadocs-mdx/next';
import type { NextConfig } from 'next';

const withMDX = createMDX();

const isGitHubPages = process.env.DEPLOY_TARGET === 'github';

/**
 * GitHub Pages serves a project site from `https://<owner>.github.io/<repo>/`,
 * so every emitted asset and route needs the repository segment as a prefix.
 * Without it the static export deploys but every request 404s.
 */
const basePath = isGitHubPages
  ? `/${process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'hammer'}`
  : '';

const config: NextConfig = {
  reactStrictMode: true,
  basePath,
  turbopack: {
    root: path.resolve(__dirname, '../..'),
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.alias = {
      ...webpackConfig.resolve.alias,
      '@chaos-design/color-picker': path.resolve(
        __dirname,
        '../../packages/shadcn-ui/color-picker/src/index.tsx',
      ),
    };
    return webpackConfig;
  },
  serverExternalPackages: [
    'ts-morph',
    'typescript',
    'oxc-transform',
    'twoslash',
    'shiki',
    '@takumi-rs/core',
  ],
  images: {
    formats: ['image/avif', 'image/webp'],
    unoptimized: isGitHubPages,

    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.logo.dev',
      },
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com',
      },
      {
        protocol: 'https',
        hostname: 'abs.twimg.com',
      },
    ],
  },
  output: isGitHubPages ? 'export' : undefined,
  trailingSlash: isGitHubPages,
  async redirects() {
    return [
      // Redirect removed matrix-card component to home page
      // {
      //   source: '/docs/components/calendar',
      //   destination: '/docs/blocks/calendar',
      //   permanent: true,
      // },
      // {
      //   source: '/docs/components/color-picker',
      //   destination: '/docs/blocks/color-picker',
      //   permanent: true,
      // },
      // {
      //   source: '/docs/components/month-datepicker',
      //   destination: '/docs/blocks/month-datepicker',
      //   permanent: true,
      // },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/docs/:path*.mdx',
        destination: '/llms.mdx/:path*',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/r/(.*)',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET' },
        ],
      },
    ];
  },
};

let nextConfig = withMDX({ ...config });

if (process.env.ANALYZE === 'true') {
  nextConfig = withBundleAnalyzer()(nextConfig);
}

export default nextConfig;
