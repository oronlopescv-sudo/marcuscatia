import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'static.wixstatic.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'catiacookingmindelo.cv',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // /logo.png serves the logo uploaded in the admin (stored in MySQL).
  async rewrites() {
    return {
      beforeFiles: [{ source: '/logo.png', destination: '/api/logo' }],
      afterFiles: [],
      fallback: [],
    };
  },
  experimental: {
    // Uploads pass through middleware, which otherwise cuts request bodies at 10MB.
    middlewareClientMaxBodySize: '30mb',
  },
  output: 'standalone',
  transpilePackages: ['motion'],
};

export default nextConfig;
