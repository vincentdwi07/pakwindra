/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ['@popperjs/core'],
    experimental: {
        serverActions: true,
    },
    webpack: (config) => {
        config.module.rules.push({
            test: /\.py$/,
            use: 'raw-loader',
        });
        return config;
    },
};


export default nextConfig;
