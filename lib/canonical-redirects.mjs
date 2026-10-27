import { resolveSiteUrl } from "./seo.mjs";

export function createCanonicalRedirects(siteUrl) {
  const origin = resolveSiteUrl(siteUrl);
  const canonicalHost = new URL(origin).hostname;
  return ["aplikasid.com", "www.aplikasid.com", "aplikasid.my.id", "www.aplikasid.my.id"]
    .filter((host) => host !== canonicalHost)
    .map((host) => ({
      // Keep webhook requests, admin sessions, and existing Google verification files on their original host.
      source: "/:path((?!api(?:/|$)|_next(?:/|$)|adminn(?:/|$)|akun(?:/|$)|login(?:/|$)|google[^/]+\\.html$).*)",
      has: [{ type: "host", value: host.replaceAll(".", "\\.") }],
      destination: `${origin}/:path`,
      permanent: true
    }));
}
