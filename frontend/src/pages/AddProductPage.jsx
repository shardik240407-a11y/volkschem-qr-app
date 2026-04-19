import { Upload } from "lucide-react";
import { useEffect, useState } from "react";
import Loader from "../components/Loader";
import { createProduct } from "../services/productService";
import { DEFAULT_COMPANY_INFO } from "../utils/constants";

const EMPTY_FORM = {
  name: "",
  technical_name: "",
  description: "",
  company_info: DEFAULT_COMPANY_INFO,
  cib_reg_no: "",
  license_no: "",
  manufactured_by: "Volkschem Crop Science (P) Limited",
  marketed_by: "Volkschem Crop Science (P) Limited",
  website_link: "www.volkschem.com",
  net_content: "",
};

const EMPTY_FILES = {
  product_image: null,
  label_file: null,
  leaflet_file: null,
};

const AddProductPage = () => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [files, setFiles] = useState(EMPTY_FILES);
  const [previewUrl, setPreviewUrl] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Revoke the object URL when a new image is selected to prevent memory leaks
  useEffect(() => {
    if (!files.product_image) {
      setPreviewUrl("");
      return;
    }

    const url = URL.createObjectURL(files.product_image);
    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [files.product_image]);

  const handleInput = (event) => {
    setForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleFile = (event) => {
    const file = event.target.files?.[0] || null;
    setFiles((prev) => ({
      ...prev,
      [event.target.name]: file,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    if (!files.product_image) {
      setErrorMessage("Product image is required.");
      return;
    }

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
      payload.append("product_image", files.product_image);

      if (files.label_file) {
        payload.append("label_file", files.label_file);
      }

      if (files.leaflet_file) {
        payload.append("leaflet_file", files.leaflet_file);
      }

      const response = await createProduct(payload);

      setSuccessMessage(`Product "${response.name}" added successfully. Slug: ${response.slug}`);
      setForm(EMPTY_FORM);
      setFiles(EMPTY_FILES);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Unable to add product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-slate-500">Add Product Page</p>
        <h1 className="font-display text-3xl font-semibold text-slate-900">Add New Product</h1>
      </div>

      {successMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{errorMessage}</div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-5 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className="mb-1 block text-sm font-medium">Product Name *</span>
              <input
                name="name"
                value={form.name}
                onChange={handleInput}
                required
                placeholder="e.g., Force 9999"
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
                placeholder="e.g., GIBBERELLIC ACID 0.001% L"
                className="input"
              />
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

            <label>
              <span className="mb-1 block text-sm font-medium">Product Image *</span>
              <input type="file" name="product_image" accept="image/*" onChange={handleFile} className="file-input" required />
            </label>

            <label>
              <span className="mb-1 block text-sm font-medium">Label Upload</span>
              <input type="file" name="label_file" accept="image/*,.pdf" onChange={handleFile} className="file-input" />
            </label>

            <label className="sm:col-span-2">
              <span className="mb-1 block text-sm font-medium">Leaflet Upload</span>
              <input type="file" name="leaflet_file" accept="image/*,.pdf" onChange={handleFile} className="file-input" />
            </label>
          </div>

          {previewUrl && (
            <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              <img src={previewUrl} alt="Product preview" className="h-52 w-full object-cover" />
            </div>
          )}
        </section>

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
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-400"
            >
              <Upload size={16} />
              {loading ? "Submitting..." : "Submit Product"}
            </button>
          </div>
        </section>
      </form>
    </div>
  );
};

export default AddProductPage;
