/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for @react-pdf/renderer in serverless
  experimental: {
    serverComponentsExternalPackages: ['@react-pdf/renderer'],
  },
}

module.exports = nextConfig
