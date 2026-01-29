import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        qualities: [70, 70, 75, 90],
        remotePatterns: [
            {
                protocol: "https",
                hostname: "res.cloudinary.com",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "ranujfinqazijcyqnbhr.supabase.co",
                pathname: "/storage/**",
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
