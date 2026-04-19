import { BadgeCheck, Eye, Leaf, Skull } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import BrandLogo from "../components/BrandLogo";
import Loader from "../components/Loader";
import { verifyBatch } from "../services/batchService";
import { COMPANY_ADDRESS, CONTACT_EMAIL, CONTACT_PHONE } from "../utils/constants";

const PublicVerifyPage = () => {
  const { slug, batchNo } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await verifyBatch(slug, batchNo);
        setData(response);
      } catch (err) {
        setError(err.response?.data?.message || "Invalid or Fake Product");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, batchNo]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <Loader label="Verifying product authenticity..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-xl">
          <BrandLogo size="large" className="mx-auto" />
          <div className="mx-auto mt-8 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
            <Skull size={32} />
          </div>
          <h1 className="mt-5 font-display text-2xl font-bold text-slate-800">Invalid or Fake Product</h1>
          <p className="mt-3 text-slate-600">The scanned QR details do not match our official records.</p>
        </div>
      </div>
    );
  }

  const { product, batch } = data;

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const formatPrice = (price) => `₹ ${Number(price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

  const FieldRow = ({ label, value, check }) => (
    <div className="grid grid-cols-[140px_1fr] border-b border-slate-100 last:border-0 sm:grid-cols-[180px_1fr]">
      <div className="bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-600 sm:text-sm">{label}</div>
      <div className="flex items-center gap-1.5 bg-white px-4 py-3 text-xs font-semibold text-slate-800 sm:text-sm">
        {value}
        {check && <BadgeCheck size={14} className="text-emerald-600" />}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-200/50 p-4 font-sans sm:p-6 lg:p-10">
      <div className="mx-auto w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-300 xl:max-w-7xl">

        {/* Top Navbar */}
        <header className="flex items-center justify-between border-b border-slate-100 px-6 py-4 lg:px-10">
          <BrandLogo size="large" />
          <nav className="hidden gap-8 font-medium text-slate-600 md:flex">
            {/*<a href="#" className="hover:text-emerald-700">Home</a>
            <a href="#" className="font-bold text-emerald-700">Verify</a>
            <a href="#" className="hover:text-emerald-700">Products</a>
            <a href="#" className="hover:text-emerald-700">Support</a>*/}
          </nav>
        </header>

        {/* Banner Area */}
        <section className="px-6 pb-6 pt-10 text-center lg:px-10 lg:pt-14">
          <h1 className="font-display text-4xl font-extrabold uppercase tracking-tight text-emerald-800 md:text-5xl lg:text-6xl">
            Genuine Product
          </h1>
          <h2 className="mt-1 font-display text-3xl font-semibold text-slate-800 md:text-4xl lg:text-5xl">
            असली उत्पाद
          </h2>

          <div className="mx-auto mt-8 max-w-4xl rounded-xl bg-emerald-600 py-3 text-center text-lg font-bold text-white shadow-md sm:py-4 sm:text-xl md:rounded-2xl md:text-2xl">
            Verified Authentic via QR Scan
          </div>
        </section>

        {/* 3-Column Grid Layout */}
        <section className="grid gap-6 px-6 pb-12 lg:grid-cols-[1fr_1.5fr_1fr] lg:px-10">

          {/* Left Col: Image & Name */}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <img
              src={product.product_image}
              alt={product.name}
              className="h-64 object-contain filter drop-shadow-xl sm:h-80 lg:h-72"
            />
            <h3 className="mt-6 text-center font-display text-2xl font-bold uppercase text-slate-800">
              {product.name}
            </h3>
            <p className="mt-1 text-center text-sm font-semibold text-slate-600">
              ({product.technical_name})
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
              VERIFIED <BadgeCheck size={14} />
            </div>
          </div>

          {/* Middle Col: Specifications Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
            <FieldRow label="Technical Name" value={product.technical_name} />
            <FieldRow label="Unique Identifier" value={`${batch.batch_no}-${product.slug.substring(0, 4).toUpperCase()}`} check />
            <FieldRow label="Batch Number" value={batch.batch_no} />
            <FieldRow label="Manufacturing Date" value={formatDate(batch.manufacturing_date)} />
            <FieldRow label="Expiry Date" value={formatDate(batch.expiry_date)} />
            <FieldRow label="MRP" value={formatPrice(batch.price)} check />
            <FieldRow label="Unit Price" value={`${formatPrice(batch.price)} / ${product.net_content || "Unit"}`} check />
            <FieldRow label="Net Content" value={product.net_content || "N/A"} />
            <FieldRow label="CIB Registration No." value={product.cib_reg_no || "N/A"} check />
            <FieldRow label="License No." value={product.license_no || "N/A"} />
            <FieldRow label="Manufactured By" value={product.manufactured_by || "N/A"} />
            <FieldRow label="Marketed By" value={product.marketed_by || "N/A"} check />
            <FieldRow
              label="Website Link"
              value={
                <a
                  href={`https://${product.website_link?.replace(/^https?:\/\//, '') || "www.volkschem.com"}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-600 hover:text-emerald-700 hover:underline"
                >
                  {product.website_link || "www.volkschem.com"}
                </a>
              }
            />
          </div>

          {/* Right Col: About & Actions */}
          <div className="flex flex-col gap-5">

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Product Description</h4>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                {product.description}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Attachments</h4>
              <div className="mt-4 flex flex-col gap-3">
                {product.label_url && (
                  <a href={product.label_url} target="_blank" rel="noreferrer" className="inline-flex w-full items-center justify-between rounded-xl border-2 border-emerald-600 bg-white px-4 py-2.5 text-sm font-bold text-emerald-800 transition hover:bg-emerald-50">
                    <span className="inline-flex items-center gap-2"><Eye size={18} /> VIEW PRODUCT LABEL</span>
                    <span className="text-red-500">📄</span>
                  </a>
                )}
                {product.leaflet_url && (
                  <a href={product.leaflet_url} target="_blank" rel="noreferrer" className="inline-flex w-full items-center justify-between rounded-xl border-2 border-emerald-600 bg-white px-4 py-2.5 text-sm font-bold text-emerald-800 transition hover:bg-emerald-50">
                    <span className="inline-flex items-center gap-2"><Leaf size={18} /> VIEW INFORMATION LEAFLET</span>
                    <span className="text-red-500">📄</span>
                  </a>
                )}
                {!product.label_url && !product.leaflet_url && (
                  <p className="text-sm text-slate-500">No attachments available.</p>
                )}
              </div>
            </div>

            <div className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col items-center justify-start text-slate-800">
                <Skull size={36} className="mb-1" strokeWidth={2.5} />
                <span className="text-[10px] font-bold tracking-wider">CAUTION</span>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Warning/Precautions:</h4>
                <p className="mt-1 text-xs leading-relaxed text-slate-700">
                  Harmful if swallowed. Keep out of reach of children.
                  <br /><br />
                  <span className="font-bold">Antidote:</span> Seek immediate medical care. Consult Poison Control Center.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* Footer Area */}
        <footer className="mx-6 mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm lg:mx-10 lg:mb-10">
          <div className="grid gap-6 text-center md:grid-cols-3 md:text-left">
            <div className="flex flex-col items-center justify-center md:items-start md:justify-center">
              <BrandLogo size="large" />
              {/* <a href={`https://${product.website_link || "www.volkschem.com"}`} target="_blank" rel="noreferrer" className="mt-2 text-sm font-semibold text-emerald-700 hover:underline">
                {product.website_link || "www.volkschem.com"}
              </a> */}
            </div>

            <div className="flex flex-col justify-center border-t border-slate-200 pt-6 md:border-l md:border-t-0 md:pl-8 md:pt-0">
              <h5 className="text-sm font-bold text-slate-800">Contact Support</h5>
              <p className="mt-1 text-sm text-slate-600">{CONTACT_PHONE}</p>
              <p className="text-sm text-slate-600">{CONTACT_EMAIL}</p>
            </div>

            <div className="flex flex-col justify-center border-t border-slate-200 pt-6 md:border-l md:border-t-0 md:pl-8 md:pt-0">
              <h5 className="text-sm font-bold text-slate-800">Address</h5>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                {COMPANY_ADDRESS}
              </p>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default PublicVerifyPage;
