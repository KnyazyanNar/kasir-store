import Link from "next/link";
import { getAllProducts } from "@/lib/data/getProducts";

export default async function AdminProductsPage() {
  const products = await getAllProducts();

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Products</h1>
        <Link
          href="/admin/products/new"
          className="shrink-0 py-2 px-4 md:px-6 bg-white text-black rounded-lg text-sm font-medium hover:bg-white/90 transition-colors"
        >
          Add Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-white/50 mb-4">No products yet</p>
          <Link
            href="/admin/products/new"
            className="inline-block py-2 px-6 bg-white text-black rounded-lg text-sm font-medium hover:bg-white/90 transition-colors"
          >
            Create your first product
          </Link>
        </div>
      ) : (
        <>
        {/* Mobile: card layout */}
        <div className="md:hidden space-y-3">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/admin/products/${product.id}`}
              className="block bg-white/5 rounded-xl border border-white/10 p-4 active:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-12 h-12 rounded-lg object-cover bg-white/10 shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <span className="text-white/30 text-xs">No img</span>
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{product.name}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm text-white/60 font-mono">
                      ${(product.price / 100).toFixed(2)}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        product.is_active
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {product.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
                <svg
                  className="w-5 h-5 text-white/30 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {/* Desktop: table layout */}
        <div className="hidden md:block bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-6 py-4 text-sm font-medium text-white/50">
                  Product
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-white/50">
                  Price
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-white/50">
                  Status
                </th>
                <th className="text-right px-6 py-4 text-sm font-medium text-white/50">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover bg-white/10"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                          <span className="text-white/30 text-xs">No img</span>
                        </div>
                      )}
                      <p className="font-medium">{product.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono">
                    ${(product.price / 100).toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        product.is_active
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {product.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="inline-flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}
    </div>
  );
}
