import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100 px-4 text-center">
      <h1 className="font-display text-5xl font-semibold text-slate-900">404</h1>
      <p className="mt-2 text-slate-600">Page not found.</p>
      <Link
        to="/login"
        className="mt-6 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
      >
        Go to Login
      </Link>
    </div>
  );
};

export default NotFoundPage;
