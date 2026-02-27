import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for @opennextjs/cloudflare — do NOT set runtime = "edge" on routes
  experimental: {
    // Uncomment if you add server actions:
    // serverActions: { allowedOrigins: ["gestorfinanceiro.pt"] },
  },
};

export default nextConfig;
