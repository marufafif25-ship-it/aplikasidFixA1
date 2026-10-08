import "./globals.css";
import Script from "next/script";

const GA_MEASUREMENT_ID = "G-RDXXT1B7K2";

export const metadata = {
  title: "Aplikasi.id - Software Original untuk Kerja & Bisnis",
  description: "Toko software terpercaya untuk kebutuhan kerja, desain, editing, dan bisnis.",
  icons: {
    icon: [{ url: "/untukFaviconfix.png", type: "image/png", sizes: "500x500" }],
    apple: "/untukFaviconfix.png"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
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
