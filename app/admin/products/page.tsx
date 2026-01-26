import Link from "next/link";
import { getAllProducts } from "@/lib/data/getProducts";

export default async function AdminProductsPage() {
  const products = await getAllProducts();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Products</h1>
        <Link
          href="/admin/products/new"
          className="py-2 px-6 bg-white text-black rounded-lg text-sm font-medium hover:bg-white/90 transition-colors"
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
        <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
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
                <th className="text-left px-6 py-4 text-sm font-medium text-white/50">
                  Created
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
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover bg-white/10"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                          <span className="text-white/30 text-xs">No img</span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{product.name}</p>
                        {product.description && (
                          <p className="text-sm text-white/50 line-clamp-1">
                            {product.description}
                          </p>
                        )}
                      </div>
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
                  <td className="px-6 py-4 text-white/50 text-sm">
                    {new Date(product.created_at).toLocaleDateString()}
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
      )}
    </div>
  );
}
