import withBundleAnalyzer from '@next/bundle-analyzer';
import {createMDX} from 'fumadocs-mdx/next';
import type {NextConfig} from 'next';
import path from 'path';

const withMDX = createMDX();

const config: NextConfig = {
  reactStrictMode: true,
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
  // biome-ignore lint/suspicious/useAwait: "redirects is async"
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
  // biome-ignore lint/suspicious/useAwait: "rewrites is async"
  async rewrites() {
    return [
      {
        source: '/docs/:path*.mdx',
        destination: '/llms.mdx/:path*',
      },
    ];
  },
  // biome-ignore lint/suspicious/useAwait: "headers is async"
  async headers() {
    return [
      {
        source: '/r/(.*)',
        headers: [
          {key: 'Access-Control-Allow-Origin', value: '*'},
          {key: 'Access-Control-Allow-Methods', value: 'GET'},
        ],
      },
    ];
  },
};

let nextConfig = withMDX({...config});

if (process.env.ANALYZE === 'true') {
  nextConfig = withBundleAnalyzer()(nextConfig);
}

export default nextConfig;
