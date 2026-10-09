import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  ScanLine,
  History,
  BarChart3,
  FileText,
  User,
  Settings,
  LogOut,
  ShieldCheck,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/dashboard/recognize", label: "Recognize", icon: ScanLine },
  { to: "/dashboard/history", label: "History", icon: History },
  { to: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/dashboard/reports", label: "Reports", icon: FileText },
];

const accountItems = [
  { to: "/dashboard/profile", label: "Profile", icon: User },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ mobileOpen, onClose }) {
  const { logout, user } = useAuth();

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-colors ${
      isActive
        ? "bg-overlay/8 text-fg border border-overlay/10"
        : "text-muted hover:text-fg hover:bg-overlay/5"
    }`;

  const content = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-2 mb-8">
        <div className="flex items-center gap-2 font-display font-semibold">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet to-cyan flex items-center justify-center text-onaccent font-mono text-sm">
            AI
          </span>
          DigiSense
        </div>
        <button onClick={onClose} className="lg:hidden text-muted hover:text-fg" aria-label="Close menu">
          <X size={18} />
        </button>
      </div>

      <nav className="flex flex-col gap-1">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className={linkClass} onClick={onClose}>
            <item.icon size={17} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-6 pt-6 border-t border-border flex flex-col gap-1">
        {accountItems.map((item) => (
          <NavLink key={item.to} to={item.to} className={linkClass} onClick={onClose}>
            <item.icon size={17} />
            {item.label}
          </NavLink>
        ))}
        {user?.is_admin && (
          <NavLink to="/admin" className={linkClass} onClick={onClose}>
            <ShieldCheck size={17} />
            Admin panel
          </NavLink>
        )}
      </div>

      <button
        onClick={logout}
        className="mt-auto flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-muted hover:text-red-300 hover:bg-red-500/10 transition-colors"
      >
        <LogOut size={17} />
        Logout
      </button>
    </div>
  );

  return (
    <>
      {/* desktop */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-border glass !rounded-none p-5 sticky top-0 h-screen">
        {content}
      </aside>

      {/* mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "tween", duration: 0.25 }}
            className="relative w-64 bg-ink border-r border-border p-5 h-full"
          >
            {content}
          </motion.aside>
        </div>
      )}
    </>
  );
}
