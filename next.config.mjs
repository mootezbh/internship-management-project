/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'res.cloudinary.com', 
      'img.clerk.com',
      'images.clerk.dev',
      'images.clerk.com',
      'clerk.dev',
      'www.gravatar.com',
      'utfs.io',
      'ufs.sh'
    ],
  },
  serverExternalPackages: ['cloudinary'],
};

export default nextConfig;
