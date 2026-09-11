import type { NextConfig } from "next"

const nextConfig: NextConfig = {
    // Los E2E compilan en una carpeta aparte para no pisar el build ni el dev server.
    distDir: process.env.NEXT_DIST_DIR || ".next",
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "*.public.blob.vercel-storage.com",
            },
            {
                protocol: "https",
                hostname: "*.blob.vercel-storage.com",
            },
        ],
    },
}

export default nextConfig
