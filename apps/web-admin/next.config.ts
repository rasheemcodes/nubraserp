import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // any other Next configs you already have…
  webpack(config) {
    // ensure resolve.alias exists
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      // point @nubras/ui → your local ui package
      "@nubras/ui": path.resolve(__dirname, "packages/ui/src")
    };
    return config;
  },
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_USER_API_URL: process.env.NEXT_PUBLIC_USER_API_URL,
  },
};

export default nextConfig;
