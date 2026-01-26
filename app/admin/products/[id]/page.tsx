"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  updateProduct,
  deleteProduct,
  toggleProductActive,
  updateVariantsStock,
  addProductImage,
  deleteProductImage,
  reorderProductImages,
} from "@/lib/actions/products";
import { AVAILABLE_SIZES } from "@/lib/types/product";
import type { ProductWithVariants, ProductImage } from "@/lib/types/product";

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [product, setProduct] = useState<ProductWithVariants | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Images state
  const [images, setImages] = useState<ProductImage[]>([]);

  // Variants state
  const [stocks, setStocks] = useState<Record<string, number>>({});
  const [isSavingStock, setIsSavingStock] = useState(false);

  // Fetch product on mount
  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/admin/products/${id}`);
        if (!res.ok) throw new Error("Failed to fetch product");
        const data = await res.json();
        setProduct(data);
        setName(data.name);
        setDescription(data.description || "");
        setPrice((data.price / 100).toFixed(2));
        setIsActive(data.is_active);
        setImages(data.images || []);

        // Initialize stock values
        const stockMap: Record<string, number> = {};
        AVAILABLE_SIZES.forEach((size) => {
          const variant = data.variants.find(
            (v: { size: string }) => v.size === size
          );
          stockMap[size] = variant?.stock ?? 0;
        });
        setStocks(stockMap);
      } catch {
        setError("Failed to load product");
      } finally {
        setIsLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  async function handleAddImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const result = await addProductImage(id, formData);
      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        setImages([...images, result.data as ProductImage]);
        setSuccessMessage("Image added successfully");
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch {
      setError("Failed to upload image");
    } finally {
      setIsUploadingImage(false);
      // Reset the file input
      e.target.value = "";
    }
  }

  async function handleDeleteImage(imageId: string) {
    if (!confirm("Delete this image?")) return;

    try {
      const result = await deleteProductImage(imageId);
      if (result.error) {
        setError(result.error);
      } else {
        setImages(images.filter((img) => img.id !== imageId));
        setSuccessMessage("Image deleted");
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch {
      setError("Failed to delete image");
    }
  }

  async function handleMoveImage(imageId: string, direction: "up" | "down") {
    const currentIndex = images.findIndex((img) => img.id === imageId);
    if (currentIndex === -1) return;

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= images.length) return;

    // Swap images
    const newImages = [...images];
    [newImages[currentIndex], newImages[newIndex]] = [
      newImages[newIndex],
      newImages[currentIndex],
    ];

    setImages(newImages);

    // Save new order to database
    try {
      const result = await reorderProductImages(
        id,
        newImages.map((img) => img.id)
      );
      if (result.error) {
        // Revert on error
        setImages(images);
        setError(result.error);
      }
    } catch {
      setImages(images);
      setError("Failed to reorder images");
    }
  }

  async function handleSave() {
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const priceInCents = Math.round(parseFloat(price) * 100);

      const result = await updateProduct(id, {
        name,
        description: description || undefined,
        price: priceInCents,
        is_active: isActive,
      });

      if (result.error) {
        setError(result.error);
      } else {
        setSuccessMessage("Product updated successfully");
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch {
      setError("Failed to update product");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleToggleActive() {
    setError(null);

    try {
      const result = await toggleProductActive(id, !isActive);
      if (result.error) {
        setError(result.error);
      } else {
        setIsActive(!isActive);
        setSuccessMessage(
          `Product ${!isActive ? "activated" : "deactivated"} successfully`
        );
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch {
      setError("Failed to toggle product status");
    }
  }

  async function handleSaveStock() {
    setIsSavingStock(true);
    setError(null);

    try {
      const variants = Object.entries(stocks).map(([size, stock]) => ({
        size,
        stock,
      }));

      const result = await updateVariantsStock(id, variants);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccessMessage("Stock updated successfully");
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch {
      setError("Failed to update stock");
    } finally {
      setIsSavingStock(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await deleteProduct(id);
    } catch {
      setError("Failed to delete product");
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-white/50">Loading...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-16">
        <p className="text-white/50 mb-4">Product not found</p>
        <Link
          href="/admin/products"
          className="text-white hover:underline"
        >
          &larr; Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/products"
            className="text-white/50 hover:text-white transition-colors"
          >
            &larr; Back
          </Link>
          <h1 className="text-3xl font-bold">Edit Product</h1>
        </div>
        <button
          onClick={handleDelete}
          className="px-4 py-2 bg-red-500/10 text-red-400 rounded-lg text-sm hover:bg-red-500/20 transition-colors"
        >
          Delete Product
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400">
          {successMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h2 className="text-lg font-medium mb-6">Product Details</h2>

            <div className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-white/30 transition-colors resize-none"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Price (USD) *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">
                    $
                  </span>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    min="0"
                    step="0.01"
                    className="w-full pl-8 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-white/30 transition-colors"
                  />
                </div>
              </div>

              {/* Save Button */}
              <div className="flex items-center gap-4 pt-4">
                <button
                  onClick={handleSave}
                  disabled={isSaving || !name || !price}
                  className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>

          {/* Product Images Gallery */}
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h2 className="text-lg font-medium mb-6">Product Images</h2>
            <p className="text-sm text-white/50 mb-4">
              Upload multiple images. First image is the main hero image.
            </p>

            {/* Image Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
              {images.map((img, index) => (
                <div
                  key={img.id}
                  className="relative group aspect-square rounded-xl overflow-hidden bg-white/5"
                >
                  <img
                    src={img.url}
                    alt={`Product image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {/* Position badge */}
                  {index === 0 && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-white/90 text-black text-xs font-medium rounded">
                      Main
                    </div>
                  )}

                  {/* Action buttons overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {/* Move up */}
                    {index > 0 && (
                      <button
                        onClick={() => handleMoveImage(img.id, "up")}
                        className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
                        title="Move up"
                      >
                        &uarr;
                      </button>
                    )}

                    {/* Move down */}
                    {index < images.length - 1 && (
                      <button
                        onClick={() => handleMoveImage(img.id, "down")}
                        className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
                        title="Move down"
                      >
                        &darr;
                      </button>
                    )}

                    {/* Delete */}
                    <button
                      onClick={() => handleDeleteImage(img.id)}
                      className="w-8 h-8 bg-red-500/50 hover:bg-red-500/70 rounded-full flex items-center justify-center text-white transition-colors"
                      title="Delete"
                    >
                      &times;
                    </button>
                  </div>
                </div>
              ))}

              {/* Add image button */}
              <label className="aspect-square rounded-xl border-2 border-dashed border-white/20 hover:border-white/40 flex flex-col items-center justify-center cursor-pointer transition-colors bg-white/5 hover:bg-white/10">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAddImage}
                  className="hidden"
                  disabled={isUploadingImage}
                />
                {isUploadingImage ? (
                  <span className="text-sm text-white/50">Uploading...</span>
                ) : (
                  <>
                    <span className="text-3xl text-white/30">+</span>
                    <span className="text-xs text-white/50 mt-1">Add Image</span>
                  </>
                )}
              </label>
            </div>

            {images.length === 0 && (
              <p className="text-sm text-white/40 text-center py-4">
                No images yet. Upload your first product image.
              </p>
            )}
          </div>

          {/* Sizes & Stock */}
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h2 className="text-lg font-medium mb-6">Sizes & Stock</h2>

            <div className="space-y-4">
              {AVAILABLE_SIZES.map((size) => (
                <div
                  key={size}
                  className="flex items-center justify-between py-3 border-b border-white/5 last:border-0"
                >
                  <span className="font-medium w-16">{size}</span>
                  <div className="flex items-center gap-4">
                    <label className="text-sm text-white/50">Stock:</label>
                    <input
                      type="number"
                      value={stocks[size] ?? 0}
                      onChange={(e) =>
                        setStocks({
                          ...stocks,
                          [size]: parseInt(e.target.value) || 0,
                        })
                      }
                      min="0"
                      className="w-24 px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-white/30 transition-colors text-center"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <button
                onClick={handleSaveStock}
                disabled={isSavingStock}
                className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSavingStock ? "Saving..." : "Save Stock"}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h2 className="text-lg font-medium mb-4">Status</h2>
            <div className="flex items-center justify-between">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                  isActive
                    ? "bg-green-500/20 text-green-400"
                    : "bg-red-500/20 text-red-400"
                }`}
              >
                {isActive ? "Active" : "Inactive"}
              </span>
              <button
                onClick={handleToggleActive}
                className="text-sm text-white/70 hover:text-white transition-colors"
              >
                {isActive ? "Deactivate" : "Activate"}
              </button>
            </div>
            <p className="text-sm text-white/50 mt-3">
              {isActive
                ? "This product is visible in the store."
                : "This product is hidden from the store."}
            </p>
          </div>

          {/* Preview Card */}
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h2 className="text-lg font-medium mb-4">Preview</h2>
            <div className="aspect-square rounded-lg bg-white/10 overflow-hidden mb-4">
              {images.length > 0 ? (
                <img
                  src={images[0].url}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/30">
                  No image
                </div>
              )}
            </div>
            <h3 className="font-medium">{name || "Product Name"}</h3>
            <p className="text-white/50">
              ${price ? parseFloat(price).toFixed(2) : "0.00"}
            </p>
            {images.length > 0 && (
              <p className="text-xs text-white/40 mt-2">
                {images.length} image{images.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
