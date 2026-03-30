import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // Proxy analytics API to v.recipes
      {
        source: "/api/analytics/:path*",
        destination: "https://v.recipes/analytics/api/:path*",
      },
    ];
  },
  // Allow external images from Discord CDN
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "flagcdn.com",
      },
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
      },
    ],
  },
};

export default nextConfig;
