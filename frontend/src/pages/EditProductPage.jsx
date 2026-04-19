import { ArrowLeft, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Loader from "../components/Loader";
import { getProductById, updateProduct } from "../services/productService";

const EditProductPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [form, setForm] = useState(null); // null means not yet loaded
  const [files, setFiles] = useState({
    product_image: null,
    label_file: null,
    leaflet_file: null,
  });
  const [previewUrl, setPreviewUrl] = useState("");
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Populate form — prefer router state (already fetched), fallback to API call
  useEffect(() => {
    const stateProduct = location.state?.product;
    if (stateProduct) {
      setForm({
        name: stateProduct.name,
        technical_name: stateProduct.technical_name,
        description: stateProduct.description,
        company_info: stateProduct.company_info || "",
        cib_reg_no: stateProduct.cib_reg_no || "",
        license_no: stateProduct.license_no || "",
        manufactured_by: stateProduct.manufactured_by || "",
        marketed_by: stateProduct.marketed_by || "",
        website_link: stateProduct.website_link || "www.volkschem.com",
        net_content: stateProduct.net_content || "",
      });
      setPreviewUrl(stateProduct.product_image);
      return;
    }

    // Fallback: fetch from API
    const fetchProduct = async () => {
      setLoadingProduct(true);
      try {
        const product = await getProductById(id);
        setForm({
          name: product.name,
          technical_name: product.technical_name,
          description: product.description,
          company_info: product.company_info || "",
          cib_reg_no: product.cib_reg_no || "",
          license_no: product.license_no || "",
          manufactured_by: product.manufactured_by || "",
          marketed_by: product.marketed_by || "",
          website_link: product.website_link || "www.volkschem.com",
          net_content: product.net_content || "",
        });
        setPreviewUrl(product.product_image);
      } catch (err) {
        setErrorMessage(err.response?.data?.message || "Failed to load product.");
      } finally {
        setLoadingProduct(false);
      }
    };

    fetchProduct();
  }, [id, location.state]);

  // Preview new image selection
  useEffect(() => {
    if (!files.product_image) return;
    const url = URL.createObjectURL(files.product_image);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [files.product_image]);

  const handleInput = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleFile = (event) => {
    const file = event.target.files?.[0] || null;
    setFiles((prev) => ({ ...prev, [event.target.name]: file }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");
    setLoading(true);

    try {
      const payload = new FormData();
      payload.append("name", form.name);
      payload.append("technical_name", form.technical_name);
      payload.append("description", form.description);
      payload.append("company_info", form.company_info);
      payload.append("cib_reg_no", form.cib_reg_no);
      payload.append("license_no", form.license_no);
      payload.append("manufactured_by", form.manufactured_by);
      payload.append("marketed_by", form.marketed_by);
      payload.append("website_link", form.website_link);
      payload.append("net_content", form.net_content);

      if (files.product_image) payload.append("product_image", files.product_image);
      if (files.label_file) payload.append("label_file", files.label_file);
      if (files.leaflet_file) payload.append("leaflet_file", files.leaflet_file);

      await updateProduct(id, payload);
      setSuccessMessage("Product updated successfully.");
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Failed to update product.");
    } finally {
      setLoading(false);
    }
  };

  if (loadingProduct) {
    return <Loader label="Loading product..." />;
  }

  if (!form) {
    return (
      <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
        {errorMessage || "Product not found."}
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/admin/products")}
          className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"
          aria-label="Back to products"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <p className="text-sm text-slate-500">Edit Product</p>
          <h1 className="font-display text-3xl font-semibold text-slate-900">Edit: {form.name}</h1>
        </div>
      </div>

      {successMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-5 xl:grid-cols-2">
        {/* Left panel — files */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className="mb-1 block text-sm font-medium">Product Name *</span>
              <input
                name="name"
                value={form.name}
                onChange={handleInput}
                required
                className="input"
              />
            </label>

            <label className="sm:col-span-2">
              <span className="mb-1 block text-sm font-medium">Technical Name *</span>
              <input
                name="technical_name"
                value={form.technical_name}
                onChange={handleInput}
                required
                className="input"
              />
            </label>

            <label>
              <span className="mb-1 block text-sm font-medium">Replace Product Image</span>
              <p className="mb-1 text-xs text-slate-400">Leave empty to keep the current image</p>
              <input type="file" name="product_image" accept="image/*" onChange={handleFile} className="file-input" />
            </label>

            <label>
              <span className="mb-1 block text-sm font-medium">Replace Label</span>
              <p className="mb-1 text-xs text-slate-400">Leave empty to keep current</p>
              <input type="file" name="label_file" accept="image/*,.pdf" onChange={handleFile} className="file-input" />
            </label>

            <label className="sm:col-span-1">
              <span className="mb-1 block text-sm font-medium">Net Content</span>
              <input name="net_content" value={form.net_content} onChange={handleInput} placeholder="e.g., 1 L e" className="input" />
            </label>

            <label className="sm:col-span-1">
              <span className="mb-1 block text-sm font-medium">CIB Reg. No.</span>
              <input name="cib_reg_no" value={form.cib_reg_no} onChange={handleInput} className="input" />
            </label>

            <label className="sm:col-span-1">
              <span className="mb-1 block text-sm font-medium">License No.</span>
              <input name="license_no" value={form.license_no} onChange={handleInput} className="input" />
            </label>

            <label className="sm:col-span-1">
              <span className="mb-1 block text-sm font-medium">Manufactured By</span>
              <input name="manufactured_by" value={form.manufactured_by} onChange={handleInput} className="input" />
            </label>

            <label className="sm:col-span-1">
              <span className="mb-1 block text-sm font-medium">Marketed By</span>
              <input name="marketed_by" value={form.marketed_by} onChange={handleInput} className="input" />
            </label>

            <label className="sm:col-span-2">
              <span className="mb-1 block text-sm font-medium">Website Link</span>
              <input name="website_link" value={form.website_link} onChange={handleInput} className="input" />
            </label>

            <label className="sm:col-span-2">
              <span className="mb-1 block text-sm font-medium">Replace Leaflet</span>
              <p className="mb-1 text-xs text-slate-400">Leave empty to keep current</p>
              <input type="file" name="leaflet_file" accept="image/*,.pdf" onChange={handleFile} className="file-input" />
            </label>
          </div>

          {previewUrl && (
            <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              <img src={previewUrl} alt="Product preview" className="h-52 w-full object-cover" />
            </div>
          )}
        </section>

        {/* Right panel — text */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <label>
            <span className="mb-1 block text-sm font-medium">Product Description *</span>
            <textarea
              name="description"
              value={form.description}
              onChange={handleInput}
              required
              rows={8}
              className="input min-h-44"
            />
          </label>

          <label className="mt-4 block">
            <span className="mb-1 block text-sm font-medium">Company Information</span>
            <textarea
              name="company_info"
              value={form.company_info}
              onChange={handleInput}
              rows={6}
              className="input min-h-36"
            />
          </label>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/admin/products")}
              className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-400"
            >
              <Save size={16} />
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </section>
      </form>
    </div>
  );
};

export default EditProductPage;
