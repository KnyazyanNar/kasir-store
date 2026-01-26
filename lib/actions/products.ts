"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import type { CreateProductInput, UpdateProductInput, UpsertVariantInput } from "@/lib/types/product";

/**
 * Create a new product
 */
export async function createProduct(input: CreateProductInput) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("products")
    .insert({
      name: input.name,
      description: input.description || null,
      price: input.price,
      image_url: input.image_url || null,
      is_active: input.is_active ?? true,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating product:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/products");
  revalidatePath("/");

  return { data };
}

/**
 * Update an existing product
 */
export async function updateProduct(id: string, input: UpdateProductInput) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("products")
    .update({
      ...(input.name !== undefined && { name: input.name }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.price !== undefined && { price: input.price }),
      ...(input.image_url !== undefined && { image_url: input.image_url }),
      ...(input.is_active !== undefined && { is_active: input.is_active }),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating product:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  revalidatePath("/");

  return { data };
}

/**
 * Delete a product
 */
export async function deleteProduct(id: string) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting product:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/products");
  revalidatePath("/");

  redirect("/admin/products");
}

/**
 * Toggle product active status
 */
export async function toggleProductActive(id: string, isActive: boolean) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();

  const { error } = await supabase
    .from("products")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) {
    console.error("Error toggling product status:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  revalidatePath("/");

  return { success: true };
}

/**
 * Upsert a product variant (create or update)
 */
export async function upsertVariant(input: UpsertVariantInput) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("product_variants")
    .upsert(
      {
        product_id: input.product_id,
        size: input.size,
        stock: input.stock,
      },
      {
        onConflict: "product_id,size",
      }
    )
    .select()
    .single();

  if (error) {
    console.error("Error upserting variant:", error);
    return { error: error.message };
  }

  revalidatePath(`/admin/products/${input.product_id}`);
  revalidatePath("/");

  return { data };
}

/**
 * Update stock for multiple variants at once
 */
export async function updateVariantsStock(
  productId: string,
  variants: { size: string; stock: number }[]
) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();

  // Upsert all variants
  const { error } = await supabase
    .from("product_variants")
    .upsert(
      variants.map((v) => ({
        product_id: productId,
        size: v.size,
        stock: v.stock,
      })),
      {
        onConflict: "product_id,size",
      }
    );

  if (error) {
    console.error("Error updating variants stock:", error);
    return { error: error.message };
  }

  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/");

  return { success: true };
}

/**
 * Upload product image to Supabase Storage
 */
export async function uploadProductImage(formData: FormData) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();

  const file = formData.get("file") as File;
  if (!file) {
    return { error: "No file provided" };
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `products/${fileName}`;

  const { error: uploadError } = await supabase.storage
      .from("kasir-products")
    .upload(filePath, file);

  if (uploadError) {
    console.error("Error uploading image:", uploadError);
    return { error: uploadError.message };
  }

  const { data: urlData } = supabase.storage
      .from("kasir-products")
    .getPublicUrl(filePath);

  return { url: urlData.publicUrl };
}

/**
 * Add a new image to a product's gallery
 */
export async function addProductImage(productId: string, formData: FormData) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();

  const file = formData.get("file") as File;
  if (!file) {
    return { error: "No file provided" };
  }

  // Upload file to storage
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `products/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("kasir-products")
    .upload(filePath, file);

  if (uploadError) {
    console.error("Error uploading image:", uploadError);
    return { error: uploadError.message };
  }

  const { data: urlData } = supabase.storage
    .from("kasir-products")
    .getPublicUrl(filePath);

  // Get the next position for this product
  const { data: existingImages } = await supabase
    .from("product_images")
    .select("position")
    .eq("product_id", productId)
    .order("position", { ascending: false })
    .limit(1);

  const nextPosition = existingImages && existingImages.length > 0
    ? existingImages[0].position + 1
    : 0;

  // Insert record into product_images table
  const { data, error } = await supabase
    .from("product_images")
    .insert({
      product_id: productId,
      url: urlData.publicUrl,
      position: nextPosition,
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding product image:", error);
    return { error: error.message };
  }

  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/");

  return { data };
}

/**
 * Delete a product image
 */
export async function deleteProductImage(imageId: string) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();

  // Get the image first to know the product_id for revalidation
  const { data: image, error: fetchError } = await supabase
    .from("product_images")
    .select("*")
    .eq("id", imageId)
    .single();

  if (fetchError || !image) {
    console.error("Error fetching image:", fetchError);
    return { error: "Image not found" };
  }

  // Delete from database
  const { error } = await supabase
    .from("product_images")
    .delete()
    .eq("id", imageId);

  if (error) {
    console.error("Error deleting product image:", error);
    return { error: error.message };
  }

  // Optionally delete from storage (extract filename from URL)
  try {
    const url = new URL(image.url);
    const pathParts = url.pathname.split("/");
    const filePath = pathParts.slice(-2).join("/"); // products/filename.ext
    await supabase.storage.from("kasir-products").remove([filePath]);
  } catch {
    // Ignore storage deletion errors
  }

  revalidatePath(`/admin/products/${image.product_id}`);
  revalidatePath("/");

  return { success: true };
}

/**
 * Reorder product images
 */
export async function reorderProductImages(
  productId: string,
  imageIds: string[]
) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();

  // Update positions for each image
  const updates = imageIds.map((id, index) => ({
    id,
    position: index,
  }));

  for (const update of updates) {
    const { error } = await supabase
      .from("product_images")
      .update({ position: update.position })
      .eq("id", update.id);

    if (error) {
      console.error("Error updating image position:", error);
      return { error: error.message };
    }
  }

  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/");

  return { success: true };
}
