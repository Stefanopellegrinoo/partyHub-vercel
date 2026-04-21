/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
    allowedDevOrigins: ['local-origin.dev', '*.local-origin.dev', '100.81.177.86', 'localhost', '*.trycloudflare.com'],
}

export default nextConfig

