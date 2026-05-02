import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "gpyvaoheudkauzfigsid.supabase.co" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "graph.facebook.com" },
      { protocol: "https", hostname: "*.fbcdn.net" },
      { protocol: "https", hostname: "platform-lookaside.fbsbx.com" },
    ],
  },
};

export default nextConfig;
