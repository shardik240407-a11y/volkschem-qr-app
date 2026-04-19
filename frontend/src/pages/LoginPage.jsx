import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BrandLogo from "../components/BrandLogo";
import { useAuth } from "../context/AuthContext";
import { loginAdmin } from "../services/authService";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await loginAdmin({ email, password });
      login(data);
      navigate("/admin/add-product", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.2fr_1fr]">
      <section className="hidden bg-[radial-gradient(circle_at_20%_20%,#1d4d3d,transparent_40%),radial-gradient(circle_at_90%_10%,#86efac66,transparent_40%),linear-gradient(160deg,#061a1a,#0a2d2c_50%,#113b2a)] p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <BrandLogo />
        <div>
          <p className="mb-4 text-sm uppercase tracking-[0.3em] text-emerald-200">QR Product Authenticity</p>
          <h1 className="font-display text-4xl leading-tight">Secure verification for every pesticide batch.</h1>
          <p className="mt-4 max-w-xl text-emerald-100/90">
            Manage products once, create unlimited batches, and issue trusted verification links for QR labels.
          </p>
        </div>
        <p className="text-sm text-emerald-200">Official dashboard for Volkschem Crop Science PVT LTD</p>
      </section>

      <section className="flex items-center justify-center bg-slate-100 p-6">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-8">
          <div className="mb-6 lg:hidden">
            <BrandLogo compact />
          </div>

          <h2 className="font-display text-2xl text-slate-900">Admin Login</h2>
          <p className="mt-1 text-sm text-slate-500">Use your admin credentials to continue.</p>

          {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="Enter Your Email Here"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-400"
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default LoginPage;
