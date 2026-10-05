/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin',
                    },
                ],
            },
            // Anatomy models are versioned with ?v= (see MODEL_VERSION in lib/atlas/head.ts), so they can be cached for good.
            ...(process.env.NODE_ENV === 'production'
                ? [{ source: '/models/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] }]
                : []),
        ];
    },
    async redirects() {
        return [
            {
                source: '/:path*',
                has: [
                    {
                        type: 'host',
                        value: 'www.jasmindezotti.com',
                    },
                ],
                destination: 'https://jasmindezotti.com/:path*',
                permanent: true,
            },
            // The experimental surgery walkthrough was replaced by the anatomy explorer.
            { source: '/cirurgias/septoplastia', destination: '/anatomia', permanent: false },
        ];
    },
};

module.exports = nextConfig;
