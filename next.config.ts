import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        hostname: '*.housesigma.com',
      },
    ],
  },
}

export default nextConfig
