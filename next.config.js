/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // App Routerを有効化
    appDir: true,
  },
  // ゲーム用の最適化設定
  webpack: (config, { isServer }) => {
    // Canvas/WebGL関連のクライアントサイド最適化
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    return config;
  },
  // 開発時の設定
  env: {
    CUSTOM_KEY: process.env.NODE_ENV === 'development' ? 'dev' : 'prod',
  },
  // 静的アセット最適化
  images: {
    domains: [],
  },
  // パフォーマンス最適化
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,
};

module.exports = nextConfig;