"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { shouldTrackMetaPageView } from "../lib/meta-pixel.mjs";

export default function MetaPixelPageViews() {
  const pathname = usePathname();
  const previousPathname = useRef(null);

  useEffect(() => {
    const previous = previousPathname.current;
    previousPathname.current = pathname;

    if (previous === null || !shouldTrackMetaPageView(previous, pathname)) return;
    if (typeof window.fbq === "function") window.fbq("track", "PageView");
  }, [pathname]);

  return null;
}
