/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/webp"],
    localPatterns: [
      { pathname: "/assets/**", search: "" },
      { pathname: "/api/product-image/**" }
    ]
  }
};
export default nextConfig;
