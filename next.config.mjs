import createNextIntlPlugin from "next-intl/plugin";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  experimental: {
    outputFileTracingIncludes: {
      "/": ["./node_modules/next-intl/**/*"],
    },
  },
  async redirects() {
    return [
      {
        source: "/:locale/dashboard",
        destination: "/:locale/dashboard/overview",
        permanent: false,
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin("./i18n.ts");

export default withNextIntl(nextConfig);
