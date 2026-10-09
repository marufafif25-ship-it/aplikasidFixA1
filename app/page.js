import Storefront from "./storefront";
import { getStorefront } from "../lib/storefront-server";
import { connection } from "next/server";
import { SITE_URL } from "../lib/seo.mjs";

const homeTitle = "Software untuk Kuliah, Riset & Kerja | Aplikasi.id";
const homeDescription = "Temukan software untuk skripsi, riset, desain, dan produktivitas kerja. Cek pilihan produk, versi, harga, serta panduan instalasi di Aplikasi.id.";

export const metadata = {
  title: homeTitle,
  description: homeDescription,
  alternates: { canonical: "/" },
  openGraph: { url: SITE_URL, title: homeTitle, description: homeDescription },
  twitter: {
    card: "summary_large_image",
    title: homeTitle,
    description: homeDescription,
    images: [{ url: "/twitter-image", alt: "Aplikasi.id — software untuk kuliah, riset, desain, dan kerja" }]
  }
};

export default async function HomePage() {
  await connection();
  const initialData = await getStorefront();
  return <Storefront initialData={initialData} />;
}
