import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export", 
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-ffe943280a474d23831e9e1639e39de2.r2.dev",
      },
    ],
  },
  transpilePackages: ["three", "@react-three/fiber", "@react-three/drei"],
};

export default nextConfig;