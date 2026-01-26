import Link from "next/link";
import { getAllProducts } from "@/lib/data/getProducts";

export default async function AdminDashboard() {
  const products = await getAllProducts();
  const activeProducts = products.filter((p) => p.is_active);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Products Card */}
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
          <h3 className="text-sm text-white/50 uppercase tracking-wider mb-2">
            Total Products
          </h3>
          <p className="text-4xl font-bold">{products.length}</p>
          <p className="text-sm text-white/50 mt-2">
            {activeProducts.length} active
          </p>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
          <h3 className="text-sm text-white/50 uppercase tracking-wider mb-4">
            Quick Actions
          </h3>
          <div className="space-y-2">
            <Link
              href="/admin/products/new"
              className="block w-full py-2 px-4 bg-white text-black rounded-lg text-center text-sm font-medium hover:bg-white/90 transition-colors"
            >
              Add New Product
            </Link>
            <Link
              href="/admin/products"
              className="block w-full py-2 px-4 bg-white/10 text-white rounded-lg text-center text-sm font-medium hover:bg-white/20 transition-colors"
            >
              Manage Products
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Products */}
      <div>
        <h2 className="text-xl font-bold mb-4">Recent Products</h2>
        {products.length === 0 ? (
          <p className="text-white/50">No products yet. Create your first product!</p>
        ) : (
          <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-6 py-3 text-sm font-medium text-white/50">
                    Name
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-white/50">
                    Price
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-white/50">
                    Status
                  </th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-white/50">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.slice(0, 5).map((product) => (
                  <tr key={product.id} className="border-b border-white/5">
                    <td className="px-6 py-4">{product.name}</td>
                    <td className="px-6 py-4">${(product.price / 100).toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
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
                        className="text-sm text-white/70 hover:text-white transition-colors"
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
    </div>
  );
}
