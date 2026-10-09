import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Database,
  BarChart3,
  Cpu,
  ScrollText,
  LogOut,
  ArrowLeft,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import ThemeToggle from "../ThemeToggle";

const navItems = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/predictions", label: "Predictions", icon: Database },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/model", label: "Model Stats", icon: Cpu },
  { to: "/admin/logs", label: "System Logs", icon: ScrollText },
];

export default function AdminSidebar({ mobileOpen, onClose }) {
  const { logout } = useAuth();

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-colors ${
      isActive
        ? "bg-overlay/8 text-fg border border-overlay/10"
        : "text-muted hover:text-fg hover:bg-overlay/5"
    }`;

  const content = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-2 mb-1">
        <div className="flex items-center gap-2 font-display font-semibold">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-400 flex items-center justify-center text-onaccent font-mono text-sm">
            A
          </span>
          DigiSense
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button onClick={onClose} className="lg:hidden text-muted hover:text-fg" aria-label="Close menu">
            <X size={18} />
          </button>
        </div>
      </div>
      <span className="text-[10px] font-mono uppercase tracking-widest text-red-300/80 px-2 mb-7 block">
        Admin panel
      </span>

      <nav className="flex flex-col gap-1">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className={linkClass} onClick={onClose}>
            <item.icon size={17} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-border flex flex-col gap-1">
        <NavLink to="/dashboard" className={linkClass}>
          <ArrowLeft size={17} />
          Back to app
        </NavLink>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-muted hover:text-red-300 hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-border glass !rounded-none p-5 sticky top-0 h-screen">
        {content}
      </aside>

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
