import Link from "next/link";
import { connection } from "next/server";
import CatalogPageNav from "../catalog-page-nav";
import StoreInformationLinks from "../store-information-links";
import { getStorefront } from "../../lib/storefront-server";
import { getStoreProfile } from "../../lib/store-profile.mjs";

export default async function StoreInformationLayout({ children }) {
  await connection();
  const { footer } = await getStorefront();
  const profile = getStoreProfile(footer);
  return <>
    <CatalogPageNav />
    <main className="catalog-seo-page store-information-page"><div className="container">
      <nav className="catalog-breadcrumbs" aria-label="Breadcrumb"><Link href="/">Beranda</Link><span aria-hidden="true">/</span><span>Informasi toko</span></nav>
      {children}
    </div></main>
    <footer className="footer"><div className="container"><div className="footer-brand"><strong>{profile.brand}</strong><small>Dikelola oleh {profile.operatorName}</small></div><StoreInformationLinks /></div></footer>
  </>;
}
