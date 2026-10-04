import type { NextConfig } from 'next';

// Security headers live in vercel.json, not here: `headers()` is not supported with
// `output: 'export'` and would be ignored without any error.
const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: false,
  reactStrictMode: true,
};

export default nextConfig;
