import Storefront from "./storefront";
import { getStorefront } from "../lib/storefront-server";
import { connection } from "next/server";

export default async function HomePage() {
  await connection();
  const initialData = await getStorefront();
  return <Storefront initialData={initialData} />;
}
