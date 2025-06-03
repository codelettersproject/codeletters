
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  devIndicators: false,

  eslint: { ignoreDuringBuilds: true },
  
  async redirects() {
    return [ ];
  },
  async rewrites() {
    return [ ];
  },
  async headers() {
    // Security Headers based on: https://nextjs.org/docs/advanced-features/security-headers
    // TODO: implement "Content-Security-Policy" section
    const securityHeaders = [
      {
        key: 'X-DNS-Prefetch-Control',
        value: 'on',
      },
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload',
      },
      {
        key: 'X-XSS-Protection',
        value: '1; mode=block',
      },
      {
        key: 'X-Frame-Options',
        value: 'SAMEORIGIN',
      },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=()',
      },
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
      },
      {
        key: 'Referrer-Policy',
        value: 'origin-when-cross-origin',
      },
    ];

    const corsOrigin = process.env.API_CORS_ORIGIN || process.env.NEXT_PUBLIC_APP_URL;

    if(!corsOrigin) {
      console.warn('[INIT] Project config has not a cors request constraint for next /api...');
    }
    
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },

      // ENABLES CORS
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: corsOrigin ?? '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
