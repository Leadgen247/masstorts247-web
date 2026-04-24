/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        // Next.js handles these routes
        { source: '/signin', destination: '/signin' },
        { source: '/sign-up', destination: '/sign-up' },
        { source: '/sign-up/:path*', destination: '/sign-up/:path*' },
        { source: '/dashboard', destination: '/dashboard' },
        { source: '/dashboard/:path*', destination: '/dashboard/:path*' },
        { source: '/api/:path*', destination: '/api/:path*' },
      ],
    };
  },
  // Allow static HTML files in /public to be served
  trailingSlash: false,
};

module.exports = nextConfig;
