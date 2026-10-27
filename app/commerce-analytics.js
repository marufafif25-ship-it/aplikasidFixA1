"use client";

import { useEffect, useRef } from "react";
import { trackProductEvent, trackWhatsAppClick } from "../lib/commerce-analytics.mjs";

export default function ContactAnalytics() {
  useEffect(() => {
    const onClick = (event) => {
      const link = event.target.closest?.("a[href]");
      if (link) trackWhatsAppClick(link.href);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return null;
}

export function ProductViewAnalytics({ product }) {
  const previousId = useRef(null);
  useEffect(() => {
    if (previousId.current === product.id) return;
    previousId.current = product.id;
    trackProductEvent("view_item", product);
  }, [product]);
  return null;
}

export function ProductCheckoutLink({ product, href, children }) {
  return <a className="catalog-page-button product-buy-button" href={href} target="_blank" rel="noreferrer" onClick={() => trackProductEvent("begin_checkout", product)}>{children}</a>;
}
