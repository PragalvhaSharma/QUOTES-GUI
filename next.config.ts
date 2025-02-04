import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      }
    ],
  },
  experimental: {
    urlImports: true,
  },
  webpack: (config) => {
    config.experiments = {
      ...config.experiments,
      buildHttp: {
        allowedUris: [
          'https://**',
          'http://**'
        ]
      }
    };
    return config;
  }
};

export default nextConfig;
