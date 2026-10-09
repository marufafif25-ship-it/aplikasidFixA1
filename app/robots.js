import { createRobots, SITE_URL } from "../lib/seo.mjs";

export default function robots() {
  return createRobots(SITE_URL);
}
