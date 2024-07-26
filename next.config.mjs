/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, options) => {
    config.experiments = {
      asyncWebAssembly: true,
      syncWebAssembly: true,
      layers: true,
    };
    return config;
  },
};

export default nextConfig;
