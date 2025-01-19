import { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const internalHost = process.env.TAURI_DEV_HOST || 'localhost';

/** @type {import('next').NextConfig} */
const nextConfig:NextConfig = {
  // Ensure uses SSG
  output: 'export',
  // Ensure the Next.js Image component in SSG mode
  images: {
    unoptimized: true,
  },
  // Configure assetPrefix
  assetPrefix: isProd ? undefined : `http://${internalHost}:3000`,
};

export default nextConfig;