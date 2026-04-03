import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    preloadEntriesOnStart: true,
    cssChunking: true,
    optimizeCss: true,
    serverMinification: true
  },
  compiler: {
    removeConsole: {
      exclude: ['error', 'warn', 'info'],
    },
  }
};

export default nextConfig;
