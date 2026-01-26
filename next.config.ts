import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        qualities: [70, 70, 75, 90],
        remotePatterns: [
            {
                protocol: "https",
                hostname: "**.supabase.co",
                pathname: "/storage/v1/object/public/**",
            },
        ],
    },

    experimental: {
        serverActions: {
            bodySizeLimit: "5mb",
        },
    },
};

export default nextConfig;