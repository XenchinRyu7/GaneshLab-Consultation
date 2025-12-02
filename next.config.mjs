/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  output: process.env.NODE_ENV === "production" ? "standalone" : undefined,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  async redirects() {
    return [
      {
        source: "/dashboard",
        destination: "/dashboard/overview",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;

