/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true, // optional, if you're using <Image>
  },
};

module.exports = nextConfig;
