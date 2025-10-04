import type { NextConfig } from "next";

const BACKEND_URL = process.env.BACKEND_URL || "https://study-material-backend.fly.dev";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
