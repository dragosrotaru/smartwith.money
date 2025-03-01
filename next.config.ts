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
      {
        hostname: '*.ratehub.ca',
      },
    ],
  },
}

export default nextConfig
