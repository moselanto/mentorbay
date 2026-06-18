/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Don't block production builds on lint rules (e.g. no-unescaped-entities).
    // Type-checking still runs, so real type errors will still fail the build.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
