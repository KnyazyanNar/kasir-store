import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import type { Product, ProductVariant, ProductImage, ProductWithVariants } from "@/lib/types/product";

/**
 * Fetch a single product by ID with its variants and images (for admin).
 * Uses admin client (bypasses RLS).
 */
export async function getProductById(id: string): Promise<ProductWithVariants | null> {
  const supabase = createSupabaseAdminClient();

  // Fetch product from products table
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (productError || !product) {
    console.error("Error fetching product:", productError);
    return null;
  }

  // Fetch variants from product_variants table
  const { data: variants, error: variantsError } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", id)
    .order("size");

  if (variantsError) {
    console.error("Error fetching variants:", variantsError);
  }

  // Fetch images from product_images table
  const { data: images, error: imagesError } = await supabase
    .from("product_images")
    .select("*")
    .eq("product_id", id)
    .order("position", { ascending: true });

  if (imagesError) {
    console.error("Error fetching images:", imagesError);
  }

  return {
    ...(product as Product),
    variants: (variants as ProductVariant[]) || [],
    images: (images as ProductImage[]) || [],
  };
}

/**
 * Fetch a single active product by ID with its variants and images (for storefront).
 * Uses regular client (respects RLS).
 */
export async function getActiveProductById(id: string): Promise<ProductWithVariants | null> {
  const supabase = await createSupabaseServerClient();

  // Fetch active product only
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (productError || !product) {
    return null;
  }

  // Fetch variants
  const { data: variants } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", id)
    .order("size");

  // Fetch images
  const { data: images } = await supabase
    .from("product_images")
    .select("*")
    .eq("product_id", id)
    .order("position", { ascending: true });

  return {
    ...(product as Product),
    variants: (variants as ProductVariant[]) || [],
    images: (images as ProductImage[]) || [],
  };
}
