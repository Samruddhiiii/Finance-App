/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    outputFileTracingExcludes: {
      "/*": ["./public/content/**/*.jpg"],
      "/**/*": ["./public/content/**/*.jpg"],
      "/**/*": ["./"]
    },
  },
  serverExternalPackages: ["@prisma/client", "prisma"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "randomuser.me",
      },
    ],
  },

  experimental: {
    serverActions: {
      bodySizeLimit: "25mb",
    },
  },
};

export default nextConfig;