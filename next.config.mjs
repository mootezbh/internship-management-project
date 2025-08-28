/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.ufs.sh' },
      { protocol: 'https', hostname: 'utfs.io' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'img.clerk.com' },
      { protocol: 'https', hostname: 'images.clerk.dev' },
      { protocol: 'https', hostname: 'images.clerk.com' },
      { protocol: 'https', hostname: 'clerk.dev' },
      { protocol: 'https', hostname: 'www.gravatar.com' }
    ],
  },
  serverExternalPackages: ['pdf-parse'],
};

export default nextConfig;
