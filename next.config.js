/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    OPENCLAW_GATEWAY_URL: process.env.OPENCLAW_GATEWAY_URL || '',
    OPENCLAW_GATEWAY_TOKEN: process.env.OPENCLAW_GATEWAY_TOKEN || '',
  }
}
module.exports = nextConfig
