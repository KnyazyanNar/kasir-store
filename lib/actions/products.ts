"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db, admin } from "@/lib/firebase-admin";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";
import { logError } from "@/lib/logger";

type CreateProductInput = {
  name: string;
  price: number;
  images?: string[];
};

type UpdateProductInput = {
  name?: string;
  price?: number;
  images?: string[];
  is_active?: boolean;
};

/**
 * Create a new product
 */
export async function createProduct(input: CreateProductInput) {
  await requireAdmin();

  try {
    const productRef = db.collection("products").doc();

    await productRef.set({
      name: input.name,
      price: input.price,
      images: input.images || [],
      is_active: true,
    });

    revalidatePath("/admin/products");
    revalidatePath("/");

    return { data: { id: productRef.id } };
  } catch (error) {
    logError("[admin/products] Failed to create product", error);
    return { error: error instanceof Error ? error.message : "Failed to create product" };
  }
}

/**
 * Update an existing product
 */
export async function updateProduct(id: string, input: UpdateProductInput) {
  await requireAdmin();

  try {
    const productRef = db.collection("products").doc(id);

    const updateData: Record<string, unknown> = {};

    if (input.name !== undefined) updateData.name = input.name;
    if (input.price !== undefined) updateData.price = input.price;
    if (input.images !== undefined) updateData.images = input.images;
    if (input.is_active !== undefined) updateData.is_active = input.is_active;

    await productRef.update(updateData);

    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${id}`);
    revalidatePath("/");

    return { data: { id } };
  } catch (error) {
    logError("[admin/products] Failed to update product", error);
    return { error: error instanceof Error ? error.message : "Failed to update product" };
  }
}

/**
 * Delete a product
 */
export async function deleteProduct(id: string) {
  await requireAdmin();

  try {
    // Delete all variants in product_variants collection
    const variantsSnapshot = await db
      .collection("product_variants")
      .where("product_id", "==", id)
      .get();

    const batch = db.batch();
    variantsSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Delete the product document
    batch.delete(db.collection("products").doc(id));

    await batch.commit();

    revalidatePath("/admin/products");
    revalidatePath("/");
  } catch (error) {
    logError("[admin/products] Failed to delete product", error);
    return { error: error instanceof Error ? error.message : "Failed to delete product" };
  }

  redirect("/admin/products");
}

/**
 * Toggle product active status
 */
export async function toggleProductActive(id: string, is_active: boolean) {
  await requireAdmin();

  try {
    const productRef = db.collection("products").doc(id);
    await productRef.update({
      is_active,
    });

    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${id}`);
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    logError("[admin/products] Failed to toggle product status", error);
    return { error: error instanceof Error ? error.message : "Failed to toggle product status" };
  }
}

/**
 * Update stock for multiple variants at once
 * Uses separate product_variants collection
 */
export async function updateVariantsStock(
  productId: string,
  variants: { size: string; stock: number }[]
) {
  await requireAdmin();

  try {
    const batch = db.batch();

    for (const variant of variants) {
      // Check if variant exists
      const existingSnap = await db
        .collection("product_variants")
        .where("product_id", "==", productId)
        .where("size", "==", variant.size)
        .limit(1)
        .get();

      if (!existingSnap.empty) {
        // Update existing variant
        batch.update(existingSnap.docs[0].ref, { stock: variant.stock });
      } else {
        // Create new variant
        const newVariantRef = db.collection("product_variants").doc();
        batch.set(newVariantRef, {
          product_id: productId,
          size: variant.size,
          stock: variant.stock,
        });
      }
    }

    await batch.commit();

    revalidatePath(`/admin/products/${productId}`);
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    logError("[admin/products] Failed to update variants stock", error);
    return { error: error instanceof Error ? error.message : "Failed to update variants stock" };
  }
}

/**
 * Upload product image to Cloudinary
 */
export async function uploadProductImage(formData: FormData) {
  await requireAdmin();

  const file = formData.get("file") as File;
  if (!file) {
    return { error: "No file provided" };
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await uploadToCloudinary(buffer, {
      folder: "kasir-products",
    });

    return { url: result.url, publicId: result.publicId };
  } catch (error) {
    logError("[admin/products] Failed to upload product image", error);
    return { error: error instanceof Error ? error.message : "Failed to upload image" };
  }
}

/**
 * Add a new image to a product's gallery
 */
export async function addProductImage(productId: string, formData: FormData) {
  await requireAdmin();

  const file = formData.get("file") as File;
  if (!file) {
    return { error: "No file provided" };
  }

  try {
    // Upload to Cloudinary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await uploadToCloudinary(buffer, {
      folder: "kasir-products",
    });

    // Add image URL to product's images array
    const productRef = db.collection("products").doc(productId);
    await productRef.update({
      images: admin.firestore.FieldValue.arrayUnion(result.url),
    });

    revalidatePath(`/admin/products/${productId}`);
    revalidatePath("/");

    return { data: { url: result.url, publicId: result.publicId } };
  } catch (error) {
    logError("[admin/products] Failed to add product image", error);
    return { error: error instanceof Error ? error.message : "Failed to add image" };
  }
}

/**
 * Delete a product image
 */
export async function deleteProductImage(productId: string, imageUrl: string) {
  await requireAdmin();

  try {
    // Remove image URL from product's images array
    const productRef = db.collection("products").doc(productId);
    await productRef.update({
      images: admin.firestore.FieldValue.arrayRemove(imageUrl),
    });

    // Try to delete from Cloudinary
    try {
      const urlParts = imageUrl.split("/");
      const folderAndFile = urlParts.slice(-2).join("/");
      const publicId = folderAndFile.replace(/\.[^/.]+$/, "");
      await deleteFromCloudinary(publicId);
    } catch {
      // Ignore Cloudinary deletion errors
    }

    revalidatePath(`/admin/products/${productId}`);
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    logError("[admin/products] Failed to delete product image", error);
    return { error: error instanceof Error ? error.message : "Failed to delete image" };
  }
}

/**
 * Reorder product images
 */
export async function reorderProductImages(
  productId: string,
  imageUrls: string[]
) {
  await requireAdmin();

  try {
    const productRef = db.collection("products").doc(productId);
    await productRef.update({
      images: imageUrls,
    });

    revalidatePath(`/admin/products/${productId}`);
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    logError("[admin/products] Failed to reorder product images", error);
    return { error: error instanceof Error ? error.message : "Failed to reorder images" };
  }
}
