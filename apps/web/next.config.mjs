import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: Boolean(process.env.VERCEL),
  },
  images: {
    unoptimized: true,
  },
  redirects: async () => [
    {
      source: "/namaste-demo",
      destination: "https://youtu.be/JePs5P7x00Q",
      permanent: true,
    },
  ],
};

export default withMDX(config);
