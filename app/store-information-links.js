import Link from "next/link";
import { storeInformationPages } from "../lib/store-profile.mjs";

export default function StoreInformationLinks() {
  return <nav className="store-information-links" aria-label="Informasi toko">
    {storeInformationPages.map(({ path, label }) => <Link key={path} href={path}>{label}</Link>)}
  </nav>;
}
