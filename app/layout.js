import "./globals.css";
import Script from "next/script";
import MetaPixelPageViews from "./meta-pixel-page-views";
import { META_PIXEL_ID } from "../lib/meta-pixel.mjs";

const GA_MEASUREMENT_ID = "G-RDXXT1B7K2";

export const metadata = {
  title: "Aplikasid | Software untuk Kuliah, Kerja & Kebutuhan Digital",
  description: "Temukan software untuk kuliah, penelitian, desain, dan kerja di Aplikasid. Cek pilihan produk, harga, serta panduan instalasinya.",
  icons: {
    icon: [{ url: "/untukFaviconfix.png", type: "image/png", sizes: "500x500" }],
    apple: "/untukFaviconfix.png"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
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
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){window.dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}');`}
      </Script>
    </html>
  );
}
