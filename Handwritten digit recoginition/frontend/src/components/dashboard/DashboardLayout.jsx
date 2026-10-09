import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import NotificationPermissionBanner from "../NotificationPermissionBanner";

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-ink text-fg font-body flex">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex-1 min-w-0">
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <main className="p-5 sm:p-7">
          <NotificationPermissionBanner />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
