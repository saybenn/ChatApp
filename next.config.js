/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      "www.freeiconspng.com",
      "www.cdn.pixabay.com",
      "www.i.pinimg.com",
      "www.randomuser.me",
      "www.upload.wikimedia.org",
      "lh3.googleusercontent.com",
      "firebasestorage.googleapis.com",
    ],
  },
};

module.exports = nextConfig;

