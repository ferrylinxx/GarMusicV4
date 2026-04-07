import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    localPatterns: [
      { pathname: "/avatars/**" },
      { pathname: "/uploads/**" },
    ],
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
