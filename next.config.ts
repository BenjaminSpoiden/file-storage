import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        hostname: 'img.clerk.com'
      },
      {
        hostname: 'small-moose-949.convex.cloud'
      }
    ]
  }
};

export default nextConfig;
