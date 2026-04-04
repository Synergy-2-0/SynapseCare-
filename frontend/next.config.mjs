const gatewayUrl = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8080/api';

const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/backend-api/:path*',
        destination: `${gatewayUrl}/:path*`
      }
    ];
  }
};

export default nextConfig;
