import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        hostname: '*.housesigma.com',
      },
      {
        hostname: 'api.dicebear.com',
      },
    ],
  },
}

export default nextConfig
