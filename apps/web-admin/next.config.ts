import path from 'path';
import type { NextConfig } from 'next';

// const allowedApiUrl = process.env.NEXT_PUBLIC_USER_API_URL;
const nextConfig: NextConfig = {
  // any other Next configs you already have…
  webpack(config) {
    // ensure resolve.alias exists
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      // point @nubras/ui → your local ui package
      '@nubras/ui': path.resolve(__dirname, 'packages/ui/src'),
    };
    return config;
  },
  // reactStrictMode: true,

  // OWASP A05: Security Misconfiguration - Security Headers
  // async headers() {
  //   return [
  //     {
  //       source: '/(.*)',
  //       headers: [
  //         // OWASP: Prevent clickjacking
  //         {
  //           key: 'X-Frame-Options',
  //           value: 'DENY',
  //         },
  //         // OWASP: Prevent MIME type sniffing
  //         {
  //           key: 'X-Content-Type-Options',
  //           value: 'nosniff',
  //         },
  //         // OWASP: Control referrer information
  //         {
  //           key: 'Referrer-Policy',
  //           value: 'strict-origin-when-cross-origin',
  //         },
  //         // OWASP: Enable XSS protection
  //         {
  //           key: 'X-XSS-Protection',
  //           value: '1; mode=block',
  //         },
  //         // OWASP: Content Security Policy

  //         {
  //           key: 'Content-Security-Policy',
  //           value: [
  //             "default-src 'self'",
  //             "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // unsafe-inline & eval are fine in dev
  //             "style-src 'self' 'unsafe-inline'",
  //             "img-src 'self' data: https:",
  //             "font-src 'self' data:",
  //             `connect-src 'self' ${allowedApiUrl || ''} ${
  //               process.env.NODE_ENV !== 'production'
  //                 ? 'http://localhost:3000'
  //                 : ''
  //             }`,
  //             "frame-ancestors 'none'",
  //           ].join('; '),
  //         },
  //         // OWASP: Permissions Policy
  //         {
  //           key: 'Permissions-Policy',
  //           value: [
  //             'camera=()',
  //             'microphone=()',
  //             'geolocation=()',
  //             'payment=()',
  //             'usb=()',
  //           ].join(', '),
  //         },
  //         // OWASP: HSTS for HTTPS (production only)
  //         ...(process.env.NODE_ENV === 'production'
  //           ? [
  //               {
  //                 key: 'Strict-Transport-Security',
  //                 value: 'max-age=31536000; includeSubDomains; preload',
  //               },
  //             ]
  //           : []),
  //       ],
  //     },
  //   ];
  // },
};

export default nextConfig;
