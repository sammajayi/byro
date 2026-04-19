import type { NextConfig } from 'next';
import withBundleAnalyzer from '@next/bundle-analyzer';

const withAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname, 
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'byro-32ux.onrender.com',
        pathname: '/**',
      },
    
      {
        protocol: 'https',
        hostname: 'byro.onrender.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'byro.africa',
        pathname: '/**',
      },
    ],
  },
};

export default withAnalyzer(nextConfig);
