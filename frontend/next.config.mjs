/** @type {import('next').NextConfig} */
const nextConfig = {
  // experimental: {
  //   externalDir: true,
  // },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": ".",
    };
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "globomart-project-demo.s3.ap-south-2.amazonaws.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "gv.videocdn.alibaba.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3001",
      },
      {
        protocol: "https",
        hostname: "cdn.d4tcdn.com",
        port: "",
      },
    ],
  },
};

export default nextConfig;
