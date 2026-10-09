import "./globals.css";
import "./catalog-pages.css";
import Script from "next/script";
import MetaPixelPageViews from "./meta-pixel-page-views";
import { META_PIXEL_ID } from "../lib/meta-pixel.mjs";
import { createWebsiteStructuredData, serializeJsonLd, SITE_URL } from "../lib/seo.mjs";

const GA_MEASUREMENT_ID = "G-RDXXT1B7K2";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Software untuk Kuliah, Riset & Kerja | Aplikasi.id",
  description: "Temukan software untuk skripsi, riset, desain, dan produktivitas kerja. Cek pilihan produk, versi, harga, serta panduan instalasi di Aplikasi.id.",
  applicationName: "Aplikasi.id",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 }
  },
  openGraph: {
    type: "website",
    siteName: "Aplikasi.id",
    locale: "id_ID",
    title: "Software untuk Kuliah, Riset & Kerja | Aplikasi.id",
    description: "Temukan software untuk skripsi, riset, desain, dan produktivitas kerja. Cek pilihan produk, versi, harga, serta panduan instalasi di Aplikasi.id."
  },
  twitter: { card: "summary_large_image" },
  icons: {
    icon: [{ url: "/untukFaviconfix.png", type: "image/png", sizes: "500x500" }],
    apple: "/untukFaviconfix.png"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}');`
          }}
        />
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(createWebsiteStructuredData(SITE_URL)) }}
        />
        {children}
        <MetaPixelPageViews />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
      </body>
      <Script id="meta-pixel-init" strategy="beforeInteractive">
        {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');`}
      </Script>
    </html>
  );
}
