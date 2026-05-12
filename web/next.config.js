const withLess = require('next-with-less');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});
const { PHASE_DEVELOPMENT_SERVER } = require('next/constants');

const withPWA = require('next-pwa')({
  dest: 'public',
  runtimeCaching: [],
  register: true,
  skipWaiting: true,
  disableDevLogs: true,
  publicExcludes: ['!img/platformlogos/**/*', '!styles/admin/**/*'],
  buildExcludes: [/chunks\/pages\/admin.*/, '!**/admin/**/*'],
  sourcemap: process.env.NODE_ENV === 'development',
  disable: process.env.NODE_ENV === 'development',
});

const BACKEND_URL = process.env.OWNCAST_BACKEND_URL || 'http://localhost:8080';

async function rewrites() {
  return [
    {
      source: '/api/:path*',
      destination: `${BACKEND_URL}/api/:path*`,
    },
    {
      source: '/hls/:path*',
      destination: `${BACKEND_URL}/hls/:path*`,
    },
    {
      source: '/img/:path*',
      destination: `${BACKEND_URL}/img/:path*`,
    },
    {
      source: '/logo',
      destination: `${BACKEND_URL}/logo`,
    },
    {
      source: '/thumbnail.jpg',
      destination: `${BACKEND_URL}/thumbnail.jpg`,
    },
    {
      source: '/customjavascript',
      destination: `${BACKEND_URL}/customjavascript`,
    },
    {
      source: '/favicon.ico',
      destination: `${BACKEND_URL}/favicon.ico`,
    },
  ];
}

module.exports = async phase => {
  /**
   * @type {import('next').NextConfig}
   */
  let nextConfig = withPWA(
    withBundleAnalyzer(
      withLess({
        productionBrowserSourceMaps: process.env.SOURCE_MAPS === 'true',
        trailingSlash: true,
        reactStrictMode: true,
        eslint: {
          ignoreDuringBuilds: true,
        },
        images: {
          unoptimized: true,
        },
        swcMinify: true,
        transpilePackages: [
          'antd',
          '@ant-design',
          'rc-util',
          'rc-pagination',
          'rc-picker',
          'rc-notification',
          'rc-tooltip',
          'rc-tree',
          'rc-table',
        ],
        webpack(config) {
          config.module.rules.push({
            test: /\.svg$/i,
            issuer: /\.[jt]sx?$/,
            use: ['@svgr/webpack'],
          });

          return config;
        },
        pageExtensions: ['tsx'],
      }),
    ),
  );

  if (phase === PHASE_DEVELOPMENT_SERVER) {
    nextConfig = {
      ...nextConfig,
      rewrites,
    };
  } else {
    nextConfig = {
      ...nextConfig,
      output: 'export',
    };
  }
  return nextConfig;
};
