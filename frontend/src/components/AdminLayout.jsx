import { Boxes, CirclePlus, ClipboardCheck, LogOut, Menu, Package, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import BrandLogo from "./BrandLogo";

const navItems = [
  { to: "/admin/add-product", label: "Add Product", icon: CirclePlus },
  { to: "/admin/add-batch", label: "Add Batch", icon: ClipboardCheck },
  { to: "/admin/products", label: "Manage Products", icon: Package },
];

const AdminLayout = () => {
  const { admin, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-72 transform bg-linear-to-b from-slate-900 via-teal-950 to-emerald-950 p-5 text-white shadow-2xl transition-transform duration-200 md:static md:translate-x-0 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="mb-8 border-b border-white/20 pb-6 text-emerald-100">
            <BrandLogo compact />
          </div>

          <nav className="space-y-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                      isActive ? "bg-white/12 text-white" : "text-emerald-100 hover:bg-white/10"
                    }`
                  }
                  onClick={() => setOpen(false)}
                >
                  <Icon size={18} />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={logout}
            className="mt-8 flex w-full items-center gap-3 rounded-xl border border-white/20 px-4 py-3 text-sm font-medium text-emerald-100 hover:bg-white/10"
          >
            <LogOut size={18} />
            Logout
          </button>
        </aside>

        {open && (
          <button
            type="button"
            className="fixed inset-0 z-30 bg-black/40 md:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close sidebar"
          />
        )}

        <main className="flex-1 md:ml-0">
          <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur sm:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="rounded-lg border border-slate-200 p-2 md:hidden"
                onClick={() => setOpen((prev) => !prev)}
                aria-label="Toggle navigation"
              >
                {open ? <X size={18} /> : <Menu size={18} />}
              </button>
              <Link to="/admin/add-product" className="flex items-center gap-2 text-slate-700">
                <Boxes size={18} className="text-emerald-600" />
                <span className="text-sm font-semibold">Admin Dashboard</span>
              </Link>
            </div>

            <div className="rounded-xl border border-slate-200 px-4 py-2 text-sm">
              <p className="font-semibold">{admin?.name || "Admin User"}</p>
              <p className="text-xs text-slate-500">{admin?.email || "admin@volkschem.com"}</p>
            </div>
          </header>

          <div className="p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
