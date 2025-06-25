// /** @type {import('next').NextConfig} */
// const nextConfig = {
//     transpilePackages: ['@popperjs/core'],
//     experimental: {
//         serverActions: {},
//         serverComponentsExternalPackages: ['pdf2json', 'pdf-parse'],
//     },
//     webpack: (config) => {
//         config.module.rules.push({
//             test: /\.py$/,
//             use: 'raw-loader',
//         });
//         return config;
//     },
//     devIndicators: false 
// };


// export default nextConfig;


/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@popperjs/core'],
  experimental: {
    serverActions: {}, // harus object kosong, bukan true
  },
  serverExternalPackages: ['pdf2json', 'pdf-parse'], // pindahkan dari experimental
  webpack: (config) => {
    config.module.rules.push({
      test: /\.py$/,
      use: 'raw-loader',
    });
    return config;
  },
  devIndicators: false,
};

export default nextConfig;