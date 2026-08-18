import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Pin the workspace root. Without this, Turbopack walks up the tree
    // looking for a lockfile and can latch onto an unrelated parent directory.
    root: __dirname,
  },
};

export default nextConfig;
