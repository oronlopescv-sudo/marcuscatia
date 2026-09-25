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
  // Files uploaded after the build aren't served from /public by `next start`;
  // fall back to a route handler that reads them from disk.
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [
        { source: '/uploads/:path*', destination: '/api/media/uploads/:path*' },
        { source: '/gallery/:path+', destination: '/api/media/gallery/:path+' },
        { source: '/music/:path*', destination: '/api/media/music/:path*' },
      ],
    };
  },
  output: 'standalone',
  transpilePackages: ['motion'],
};

export default nextConfig;
