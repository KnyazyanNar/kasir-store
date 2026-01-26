import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import type { Product, ProductVariant, ProductImage, ProductWithVariants } from "@/lib/types/product";

/**
 * Fetch all active products for the storefront.
 * Uses regular client (respects RLS).
 */
export async function getProducts(): Promise<Product[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching products:", error.message, error.code, error.details);
    return [];
  }

  return data as Product[];
}

/**
 * Fetch all products for admin (including inactive).
 * Uses admin client (bypasses RLS).
 */
export async function getAllProducts(): Promise<Product[]> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching all products:", error.message, error.code, error.details);
    return [];
  }

  return data as Product[];
}

/**
 * Fetch all active products with their variants and images for the storefront.
 * Uses regular client (respects RLS).
 */
export async function getProductsWithVariants(): Promise<ProductWithVariants[]> {
  const supabase = await createSupabaseServerClient();

  // Fetch all active products
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (productsError || !products || products.length === 0) {
    if (productsError) {
      console.error("Error fetching products:", productsError);
    }
    return [];
  }

  const productIds = products.map((p) => p.id);

  // Fetch all variants for these products
  const { data: variants, error: variantsError } = await supabase
    .from("product_variants")
    .select("*")
    .in("product_id", productIds)
    .order("size");

  if (variantsError) {
    console.error("Error fetching variants:", variantsError);
  }

  // Fetch all images for these products
  const { data: images, error: imagesError } = await supabase
    .from("product_images")
    .select("*")
    .in("product_id", productIds)
    .order("position", { ascending: true });

  if (imagesError) {
    console.error("Error fetching images:", imagesError);
  }

  // Map variants and images to their products
  return products.map((product) => ({
    ...(product as Product),
    variants: ((variants as ProductVariant[]) || []).filter(
      (v) => v.product_id === product.id
    ),
    images: ((images as ProductImage[]) || []).filter(
      (img) => img.product_id === product.id
    ),
  }));
}
