import { getProductsWithVariants } from "@/lib/data/getProducts";
import { HomeClient } from "./components/HomeClient";

export default async function Home() {
  // Fetch all active products with their variants and images
  const products = await getProductsWithVariants();

  return <HomeClient products={products} />;
}
