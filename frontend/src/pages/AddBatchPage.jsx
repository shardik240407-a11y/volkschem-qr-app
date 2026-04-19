import { Check, Copy, Pencil, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import Loader from "../components/Loader";
import { createBatch, deleteBatch, getBatchesByProduct, updateBatch } from "../services/batchService";
import { getProducts } from "../services/productService";

const AddBatchPage = () => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    product_id: "",
    batch_no: "",
    manufacturing_date: "",
    expiry_date: "",
    price: "",
  });
  const [batches, setBatches] = useState([]);
  const [verificationUrl, setVerificationUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [editingBatchId, setEditingBatchId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const selectedProduct = products.find((item) => item._id === form.product_id) ?? null;

  const loadProducts = useCallback(async () => {
    try {
      setLoadingProducts(true);
      // for batch page, we want a dropdown, let's load all without limit or a large limit
      // Currently getProducts uses default limit 12, so we need to override it to maybe limit 1000 or use search.
      // For now, allow a high limit for the dropdown.
      const data = await getProducts({ limit: 1000 });
      setProducts(data.products || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load products.");
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  const loadBatches = useCallback(async (productId) => {
    if (!productId) {
      setBatches([]);
      return;
    }
    try {
      const data = await getBatchesByProduct(productId);
      setBatches(data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load batches.");
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    loadBatches(form.product_id);
    setVerificationUrl("");
    setEditingBatchId(null);
  }, [form.product_id, loadBatches]);

  const handleInput = (event) => {
    setForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setVerificationUrl("");

    if (form.manufacturing_date && form.expiry_date) {
      if (new Date(form.expiry_date) <= new Date(form.manufacturing_date)) {
        setError("Expiry date must be after manufacturing date.");
        return;
      }
    }

    setLoading(true);

    try {
      const response = await createBatch({
        ...form,
        price: Number(form.price),
      });

      setMessage("Batch created successfully.");
      setVerificationUrl(response.verification_url);
      setForm((prev) => ({
        ...prev,
        batch_no: "",
        制造业_date: "",
        expiry_date: "",
        price: "",
      }));
      loadBatches(form.product_id);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create batch.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!verificationUrl) return;
    await navigator.clipboard.writeText(verificationUrl);
    setMessage("Verification URL copied.");
  };

  // --- Batch Inline Edit & Delete ---
  const handleEditClick = (batch) => {
    setEditingBatchId(batch._id);
    setEditForm({
      batch_no: batch.batch_no,
      price: batch.price,
      // Format as YYYY-MM-DD for date inputs
      manufacturing_date: batch.manufacturing_date ? new Date(batch.manufacturing_date).toISOString().split('T')[0] : "",
      expiry_date: batch.expiry_date ? new Date(batch.expiry_date).toISOString().split('T')[0] : "",
    });
  };

  const handleEditInput = (e) => {
    setEditForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSaveEdit = async (batchId) => {
    if (new Date(editForm.expiry_date) <= new Date(editForm.manufacturing_date)) {
       alert("Expiry date must be after manufacturing date.");
       return;
    }
    
    try {
      const payload = {
        ...editForm,
        price: Number(editForm.price),
      };
      await updateBatch(batchId, payload);
      setMessage("Batch updated successfully.");
      setEditingBatchId(null);
      loadBatches(form.product_id);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update batch.");
    }
  };

  const handleDeleteBatch = async (batchId) => {
    if (!window.confirm("Are you sure you want to delete this batch?")) return;
    try {
      await deleteBatch(batchId);
      setMessage("Batch deleted successfully.");
      loadBatches(form.product_id);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete batch.");
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-slate-500">Add Batch Page</p>
        <h1 className="font-display text-3xl font-semibold text-slate-900">Manage Product Batches</h1>
      </div>

      {loadingProducts ? (
        <Loader label="Loading products..." />
      ) : (
        <div className="grid gap-5 xl:grid-cols-[1.1fr_1fr]">
          <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 h-fit">
            <h2 className="mb-4 font-display text-lg font-semibold border-b border-slate-100 pb-2">Create New Batch</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <span className="mb-1 block text-sm font-medium">Select Product *</span>
                <select name="product_id" value={form.product_id} onChange={handleInput} required className="input">
                  <option value="">Select product to manage batches</option>
                  {products.map((product) => (
                    <option key={product._id} value={product._id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="sm:col-span-2">
                <span className="mb-1 block text-sm font-medium">Batch Number *</span>
                <input
                  name="batch_no"
                  value={form.batch_no}
                  onChange={handleInput}
                  required
                  placeholder="e.g., BCH-2024-001"
                  className="input"
                />
              </label>

              <label>
                <span className="mb-1 block text-sm font-medium">Price (₹) *</span>
                <input
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={handleInput}
                  required
                  placeholder="e.g., 450"
                  className="input"
                />
              </label>

              <label>
                <span className="mb-1 block text-sm font-medium">Manufacturing Date *</span>
                <input
                  name="manufacturing_date"
                  type="date"
                  value={form.manufacturing_date}
                  onChange={handleInput}
                  required
                  className="input"
                />
              </label>

              <label>
                <span className="mb-1 block text-sm font-medium">Expiry Date *</span>
                <input
                  name="expiry_date"
                  type="date"
                  value={form.expiry_date}
                  onChange={handleInput}
                  required
                  min={form.manufacturing_date || undefined}
                  className="input"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !form.product_id}
              className="mt-5 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:bg-emerald-400"
            >
              {loading ? "Creating..." : "Create Batch"}
            </button>

            {message && <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>}
            {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

            {verificationUrl && (
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-medium text-slate-500">Generated verification URL</p>
                <p className="mt-1 break-all text-sm text-slate-700">{verificationUrl}</p>
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="mt-2 inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium hover:bg-white"
                >
                  <Copy size={14} /> Copy URL
                </button>
              </div>
            )}
          </form>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="font-display text-xl font-semibold">Existing Batches</h2>
            <p className="mb-4 mt-1 text-sm text-slate-500">
              {selectedProduct ? `Product: ${selectedProduct.name}` : "Select a product to view batches."}
            </p>

            <div className="space-y-3">
              {batches.length === 0 ? (
                <p className="rounded-lg border border-dashed border-slate-300 px-3 py-4 text-sm text-slate-500">
                  {selectedProduct ? "No batches found." : "Waiting for product selection."}
                </p>
              ) : (
                batches.map((batch) => (
                  <article key={batch._id} className="relative rounded-xl border border-slate-200 p-4 transition-all hover:border-emerald-200 hover:shadow-sm">
                    {editingBatchId === batch._id ? (
                      <div className="space-y-3">
                        <div className="grid gap-2 sm:grid-cols-2">
                           <label className="col-span-2">
                             <span className="mb-1 block text-xs font-medium text-slate-500">Batch No *</span>
                             <input name="batch_no" value={editForm.batch_no} onChange={handleEditInput} className="input py-1.5 text-sm" />
                           </label>
                           <label>
                             <span className="mb-1 block text-xs font-medium text-slate-500">Price (₹) *</span>
                             <input type="number" name="price" value={editForm.price} onChange={handleEditInput} className="input py-1.5 text-sm" />
                           </label>
                           <label className="col-span-2 sm:col-span-1">
                             <span className="mb-1 block text-xs font-medium text-slate-500">MFG Date *</span>
                             <input type="date" name="manufacturing_date" value={editForm.manufacturing_date} onChange={handleEditInput} className="input py-1.5 text-sm" />
                           </label>
                           <label className="col-span-2 sm:col-span-1">
                             <span className="mb-1 block text-xs font-medium text-slate-500">EXP Date *</span>
                             <input type="date" name="expiry_date" value={editForm.expiry_date} onChange={handleEditInput} className="input py-1.5 text-sm" />
                           </label>
                        </div>
                        <div className="flex gap-2 justify-end mt-2">
                          <button type="button" onClick={() => setEditingBatchId(null)} className="inline-flex items-center gap-1 rounded bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200">
                            <X size={14} /> Cancel
                          </button>
                          <button type="button" onClick={() => handleSaveEdit(batch._id)} className="inline-flex items-center gap-1 rounded bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700">
                            <Check size={14} /> Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="absolute top-3 right-3 flex gap-2">
                          <button type="button" onClick={() => handleEditClick(batch)} className="text-slate-400 hover:text-slate-600" aria-label="Edit batch">
                            <Pencil size={16} />
                          </button>
                          <button type="button" onClick={() => handleDeleteBatch(batch._id)} className="text-red-400 hover:text-red-600" aria-label="Delete batch">
                            <Trash2 size={16} />
                          </button>
                        </div>
                        
                        <p className="font-semibold text-slate-800 pr-16">{batch.batch_no}</p>
                        <div className="mt-3 grid grid-cols-2 gap-y-2 text-sm text-slate-600">
                           <p><span className="text-slate-400">Price:</span> ₹{batch.price.toLocaleString("en-IN")}</p>
                           <p></p>
                           <p><span className="text-slate-400">MFG:</span> {new Date(batch.manufacturing_date).toLocaleDateString("en-IN")}</p>
                           <p><span className="text-slate-400">EXP:</span> {new Date(batch.expiry_date).toLocaleDateString("en-IN")}</p>
                        </div>
                      </>
                    )}
                  </article>
                ))
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default AddBatchPage;
