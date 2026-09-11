import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    localPatterns: [
      {
        pathname: "/**",
        search: "",
      },
      {
        pathname: "/api/images/club-logo",
      },
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.a.transfermarkt.technology",
      },
      {
        protocol: "https",
        hostname: "tmssl.akamaized.net",
      },
    ],
  },
};

export default nextConfig;
