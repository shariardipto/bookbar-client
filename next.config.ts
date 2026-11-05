import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: { serverActions: { bodySizeLimit: "6mb" } },
  async redirects() {
    const authUrl = process.env.BETTER_AUTH_URL;
    if (!authUrl || !/^http:\/\/localhost(?::\d+)?\/?$/.test(authUrl))
      return [];
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "127\\.0\\.0\\.1" }],
        destination: `${new URL(authUrl).origin}/:path*`,
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
