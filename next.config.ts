import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  serverExternalPackages: ["better-sqlite3", "bcryptjs", "@libsql/client"],
}

export default nextConfig
