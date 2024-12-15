/** @type {import('next').NextConfig} */
const nextConfig = {
  // 動的ルートを使用するため、output: 'export'を削除
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;