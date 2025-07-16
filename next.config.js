/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    AZURE_MAPS_KEY: process.env.AZURE_MAPS_KEY,
  },
}

module.exports = nextConfig 