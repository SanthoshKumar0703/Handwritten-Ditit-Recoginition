import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-ink text-fg font-body flex">
      <AdminSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 glass !rounded-none border-b border-border lg:hidden">
          <div className="flex items-center gap-4 px-5 py-3.5">
            <button onClick={() => setMobileOpen(true)} className="text-muted hover:text-fg" aria-label="Open menu">
              <Menu size={20} />
            </button>
            <span className="text-sm font-display font-medium">Admin panel</span>
          </div>
        </header>
        <main className="p-5 sm:p-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
