/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export', // Export as static HTML
  images: {
    unoptimized: true, // Disable image optimization for static export
  },
  // Ensure Next.js knows this is not a server-side app
  experimental: {
    appDir: true,
  },
  // For Electron we need to properly handle asset paths
  // Remove trailing slash from URLs
  trailingSlash: true,
  assetPrefix: '/',
};

module.exports = nextConfig;