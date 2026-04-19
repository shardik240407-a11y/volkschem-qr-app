import { ChevronLeft, ChevronRight, Pencil, Search, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import { deleteProduct, getProducts } from "../services/productService";
import { LOGO_PATH } from "../utils/constants";

const ProductListPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Pagination & Search State
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getProducts({ page, search: debouncedSearch, limit: 12 });
      setProducts(data.products || []);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.totalCount || 0);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load products.");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleDelete = async (id) => {
    const isConfirmed = window.confirm("Delete this product and all related batches? This cannot be undone.");

    if (!isConfirmed) return;

    try {
      await deleteProduct(id);
      setMessage("Product deleted successfully.");
      setError("");
      loadProducts();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete product.");
    }
  };

  const handleEdit = (product) => {
    navigate(`/admin/edit-product/${product._id}`, { state: { product } });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">Manage Products</p>
          <h1 className="font-display text-3xl font-semibold text-slate-900">Product List</h1>
        </div>

        <div className="relative max-w-sm flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500"
          />
        </div>
      </div>

      {message && <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p>}
      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {loading && products.length === 0 ? (
        <Loader label="Loading products..." />
      ) : (
        <>
          <p className="text-sm text-slate-600">Showing {products.length} of {totalCount} products</p>
          
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {products.length === 0 ? (
              <p className="col-span-full rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
                No products found matching your search.
              </p>
            ) : (
              products.map((product) => (
                <article key={product._id} className="relative rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <img
                    src={LOGO_PATH}
                    alt="Volkschem logo"
                    className="absolute right-4 top-4 h-10 w-auto max-w-[120px] object-contain"
                  />
                  <img src={product.product_image} alt={product.name} className="h-44 w-full rounded-xl object-cover" />
                  <h2 className="mt-3 pr-28 font-display text-xl font-semibold text-slate-900">{product.name}</h2>
                  <p className="text-sm text-slate-500">{product.technical_name}</p>
                  <p className="mt-2 text-xs text-slate-400">Slug: {product.slug}</p>

                  <div className="mt-4 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(product)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <Pencil size={13} /> Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(product._id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-4 border-t border-slate-200 pt-6">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft size={16} /> Previous
              </button>
              <span className="text-sm font-medium text-slate-600">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductListPage;
