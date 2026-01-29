import { db } from "@/lib/firebase-admin";
import { logError } from "@/lib/logger";

export type Product = {
  id: string;
  name: string;
  price: number;
  images: string[];
  is_active: boolean;
};

export type ProductVariant = {
  size: string;
  stock: number;
};

export type ProductWithVariants = Product & {
  variants: ProductVariant[];
};

/**
 * Fetch all active products for the storefront.
 */
export async function getProducts(): Promise<Product[]> {
  try {
    const productsRef = db.collection("products");
    const snapshot = await productsRef
      .where("is_active", "==", true)
      .get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        price: data.price,
        images: data.images || [],
        is_active: data.is_active,
      };
    });
  } catch (error) {
    logError("[products] Failed to fetch active products", error);
    return [];
  }
}

/**
 * Fetch all products for admin (including inactive).
 */
export async function getAllProducts(): Promise<Product[]> {
  try {
    const productsRef = db.collection("products");
    const snapshot = await productsRef.get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        price: data.price,
        images: data.images || [],
        is_active: data.is_active,
      };
    });
  } catch (error) {
    logError("[products] Failed to fetch all products", error);
    return [];
  }
}

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
 * Fetch all active products with their variants for the storefront.
 */
export async function getProductsWithVariants(): Promise<ProductWithVariants[]> {
  try {
    const products = await getProducts();

    const productsWithVariants = await Promise.all(
      products.map(async (product) => {
        const variants = await getProductVariants(product.id);
        return {
          ...product,
          variants,
        };
      })
    );

    return productsWithVariants;
  } catch (error) {
    logError("[products] Failed to fetch products with variants", error);
    return [];
  }
}

/**
 * Fetch all products with variants for admin (including inactive).
 */
export async function getAllProductsWithVariants(): Promise<ProductWithVariants[]> {
  try {
    const products = await getAllProducts();

    const productsWithVariants = await Promise.all(
      products.map(async (product) => {
        const variants = await getProductVariants(product.id);
        return {
          ...product,
          variants,
        };
      })
    );

    return productsWithVariants;
  } catch (error) {
    logError("[products] Failed to fetch all products with variants", error);
    return [];
  }
}
