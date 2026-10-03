import path from 'node:path';
import withBundleAnalyzer from '@next/bundle-analyzer';
import { createMDX } from 'fumadocs-mdx/next';
import type { NextConfig } from 'next';
import { basePath } from './utils/base-path';

const withMDX = createMDX();

const isGitHubPages = process.env.DEPLOY_TARGET === 'github';

const config: NextConfig = {
  reactStrictMode: true,
  // GitHub Pages serves a project site from `/<repo>/`. Without this every
  // emitted asset and route is written to the site root and 404s.
  basePath,
  // Only `NEXT_PUBLIC_*` is inlined into the client bundle, so hand the value
  // to client components through the environment rather than a prop.
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
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
      // English docs live under the `/en` prefix; the markdown copy endpoint
      // (used by the "copy for LLM" button) mirrors the locale segment.
      {
        source: '/en/docs/:path*.mdx',
        destination: '/llms.mdx/en/:path*',
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
