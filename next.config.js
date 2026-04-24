/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      { source: '/disclaimer', destination: '/disclaimer.html' },
      { source: '/terms', destination: '/terms.html' },
      { source: '/privacy', destination: '/privacy.html' },
      { source: '/cookies', destination: '/cookies.html' },
      { source: '/acceptable-use', destination: '/acceptable-use.html' },
      { source: '/support', destination: '/support.html' },
    ];
  },
};

module.exports = nextConfig;
