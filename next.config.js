/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    PDF_EXTRACT_SERVICE_URL: process.env.NEXT_PUBLIC_PDF_EXTRACT_SERVICE_URL || '/api/extract'
  }
}

module.exports = nextConfig