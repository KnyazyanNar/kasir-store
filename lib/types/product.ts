// Product Types for KASIR Store

export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number; // in cents
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ProductVariant = {
  id: string;
  product_id: string;
  size: string;
  stock: number;
  created_at: string;
  updated_at: string;
};

export type ProductImage = {
  id: string;
  product_id: string;
  url: string;
  position: number;
  created_at: string;
  updated_at: string;
};

export type ProductWithVariants = Product & {
  variants: ProductVariant[];
  images: ProductImage[];
};

// For creating new products
export type CreateProductInput = {
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  is_active?: boolean;
};

// For updating products
export type UpdateProductInput = Partial<CreateProductInput>;

// For creating/updating variants
export type UpsertVariantInput = {
  product_id: string;
  size: string;
  stock: number;
};

// Available sizes
export const AVAILABLE_SIZES = ["S", "M", "L", "XL"] as const;
export type Size = (typeof AVAILABLE_SIZES)[number];