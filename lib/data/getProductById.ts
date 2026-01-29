import { db } from "@/lib/firebase-admin";
import { logError } from "@/lib/logger";
import type { Product, ProductVariant, ProductWithVariants } from "./getProducts";

/**
 * Fetch variants for a product from product_variants collection.
 */
async function getProductVariants(productId: string): Promise<ProductVariant[]> {
  try {
    const snapshot = await db
      .collection("product_variants")
      .where("product_id", "==", productId)
      .get();

    return snapshot.docs.map((doc) => ({
      size: doc.data().size,
      stock: doc.data().stock || 0,
    }));
  } catch (error) {
    logError(`[products] Failed to fetch variants for product ${productId}`, error);
    return [];
  }
}

/**
 * Convert Firestore document to Product type.
 */
function docToProduct(doc: FirebaseFirestore.DocumentSnapshot): Product | null {
  if (!doc.exists) return null;

  const data = doc.data();
  if (!data) return null;

  return {
    id: doc.id,
    name: data.name,
    price: data.price,
    images: data.images || [],
    is_active: data.is_active,
  };
}

/**
 * Fetch a single product by ID with its variants (for admin).
 */
export async function getProductById(id: string): Promise<ProductWithVariants | null> {
  try {
    const productRef = db.collection("products").doc(id);
    const productDoc = await productRef.get();

    const product = docToProduct(productDoc);
    if (!product) return null;

    const variants = await getProductVariants(id);

    return {
      ...product,
      variants,
    };
  } catch (error) {
    logError("[products] Failed to fetch product", error);
    return null;
  }
}

/**
 * Fetch a single active product by ID with its variants (for storefront).
 */
export async function getActiveProductById(id: string): Promise<ProductWithVariants | null> {
  try {
    const productRef = db.collection("products").doc(id);
    const productDoc = await productRef.get();

    const product = docToProduct(productDoc);
    if (!product || !product.is_active) return null;

    const variants = await getProductVariants(id);

    return {
      ...product,
      variants,
    };
  } catch (error) {
    logError("[products] Failed to fetch active product", error);
    return null;
  }
}
