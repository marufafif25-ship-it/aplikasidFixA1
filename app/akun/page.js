import Account from "./account";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { getStorefront } from "../../lib/storefront-server";
import { isAccountFeatureEnabled } from "../../lib/account-feature.mjs";

export const metadata = {
  title: "Akun Saya & Unduhan Pembelian | Aplikasi.id",
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  await connection();
  const { homepage } = await getStorefront();
  if (!isAccountFeatureEnabled(homepage)) redirect("/");
  return <Account />;
}
