import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Performance Optimizations */

  // Standalone output for Docker/IIS optimization
  output: 'standalone', 

  // Compress output for faster loading
  compress: true,

  // Optimize images
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
  },

  // Production optimizations
  reactStrictMode: true,
  poweredByHeader: false,


  // Disable all dev indicators (removes the floating "N" button)
  devIndicators: false,

  // Experimental features for better performance
  experimental: {
    // Optimize package imports (tree-shaking)
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      '@radix-ui/react-icons',
      'date-fns',
      'recharts',
      'clsx',
      'tailwind-merge'
    ],
  },
  // Moved from experimental as per Next.js 15+ deprecation
  skipProxyUrlNormalize: true,
  skipTrailingSlashRedirect: true,
  
  // Compiler optimization
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

export default nextConfig;
