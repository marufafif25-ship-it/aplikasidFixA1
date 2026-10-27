import { createCanonicalRedirects } from "./lib/canonical-redirects.mjs";
import { SITE_URL } from "./lib/seo.mjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  redirects: () => createCanonicalRedirects(SITE_URL),
  images: {
    formats: ["image/webp"],
    localPatterns: [
      { pathname: "/assets/**", search: "" },
      { pathname: "/api/product-image/**" }
    ]
  }
};
export default nextConfig;
