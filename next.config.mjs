/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'res.cloudinary.com', 
      'img.clerk.com',
      'images.clerk.dev',
      'images.clerk.com',
      'clerk.dev',
      'www.gravatar.com'
    ],
  },
  serverExternalPackages: ['cloudinary'],
};

export default nextConfig;
