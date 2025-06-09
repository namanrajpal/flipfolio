import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    PDF_EXTRACT_SERVICE_URL:
      process.env.NEXT_PUBLIC_PDF_EXTRACT_SERVICE_URL ||
      "http://localhost:3001/dev/extract",
  },
};

export default nextConfig;
