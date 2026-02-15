import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "jradianceco.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.jradianceco.com",
        pathname: "/**",
      },
    ],
    // image errors
    minimumCacheTTL: 60 * 60 * 24, // 24 hours
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};

export async function headers() {
  return [
    {
      source: "/(.*)",
      headers: [
        {
          key: "Content-Security-Policy",
          value:
            "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.paystack.co https://fp.paystack.co https://*.supabase.co https://*.fingerprintjs.com https://*.fpcdn.io https://*.datadoghq.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://jradianceco.com https://www.jradianceco.com; connect-src 'self' https://*.supabase.co https://*.datadoghq.com https://fp.paystack.co; frame-src 'self' https://js.paystack.co;",
        },
      ],
    },
  ];
}

export default nextConfig;
