import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "sanyglobal-img.sany.com.cn",
        pathname: "/product/**",
      },
      {
        protocol: "https",
        hostname: "static.vecteezy.com",
        pathname: "/system/resources/thumbnails/**",
      },
      {
        protocol: "https",
        hostname: "media.istockphoto.com",
        pathname: "/id/**",
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default withNextIntl(nextConfig);
