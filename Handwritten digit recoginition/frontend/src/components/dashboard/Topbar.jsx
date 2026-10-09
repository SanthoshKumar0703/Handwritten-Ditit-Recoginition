import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { Menu, Search, Bell, ChevronDown, User, Settings, LogOut, Sparkles, FileText, ShieldAlert, Megaphone, CheckCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import ThemeToggle from "../ThemeToggle";

const categoryIcon = {
  prediction: Sparkles,
  report: FileText,
  security: ShieldAlert,
  admin: Megaphone,
};

function timeAgo(isoString) {
  const seconds = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleNotifClick(n) {
    if (!n.is_read) markRead(n.id);
    setNotifOpen(false);
    if (n.link) navigate(n.link);
  }

  const initials = (user?.name || "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 glass !rounded-none border-b border-border">
      <div className="flex items-center gap-4 px-5 py-3.5">
        <button onClick={onMenuClick} className="lg:hidden text-muted hover:text-fg" aria-label="Open menu">
          <Menu size={20} />
        </button>

        <div className="relative flex-1 max-w-md hidden sm:block">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search predictions, reports…"
            className="w-full bg-overlay/5 border border-border rounded-full pl-10 pr-4 py-2 text-sm outline-none focus:border-sky/50 transition-colors placeholder:text-muted/60"
          />
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <ThemeToggle />

          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen((o) => !o)}
              className="relative w-9 h-9 rounded-full glass flex items-center justify-center text-muted hover:text-fg transition-colors"
              aria-label="Notifications"
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-br from-violet to-cyan text-onaccent text-[10px] font-mono font-semibold flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-80 glass rounded-2xl p-2 shadow-2xl max-h-[70vh] overflow-y-auto"
                >
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-xs text-muted uppercase tracking-wide">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="flex items-center gap-1 text-[11px] text-sky hover:text-fg transition-colors"
                      >
                        <CheckCheck size={12} /> Mark all read
                      </button>
                    )}
                  </div>

                  {notifications.length === 0 ? (
                    <p className="text-sm text-muted text-center py-8">Nothing yet — this fills up as you use DigiSense.</p>
                  ) : (
                    notifications.map((n) => {
                      const Icon = categoryIcon[n.category] || Sparkles;
                      return (
                        <button
                          key={n.id}
                          onClick={() => handleNotifClick(n)}
                          className={`w-full text-left flex items-start gap-2.5 px-3 py-2.5 rounded-xl hover:bg-overlay/5 transition-colors ${
                            !n.is_read ? "bg-overlay/[0.03]" : ""
                          }`}
                        >
                          <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet/20 to-sky/20 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                            <Icon size={13} className="text-sky" />
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm truncate">{n.title}</p>
                              {!n.is_read && <span className="w-1.5 h-1.5 rounded-full bg-cyan shrink-0" />}
                            </div>
                            <p className="text-xs text-muted mt-0.5 line-clamp-2">{n.message}</p>
                            <p className="text-[11px] text-muted mt-1">{timeAgo(n.created_at)}</p>
                          </div>
                        </button>
                      );
                    })
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen((o) => !o)}
              className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full glass hover:border-overlay/20 transition-colors"
            >
              <span className="w-7 h-7 rounded-full bg-gradient-to-br from-violet to-sky flex items-center justify-center text-onaccent text-xs font-semibold">
                {initials}
              </span>
              <ChevronDown size={14} className="text-muted hidden sm:block" />
            </button>
            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-56 glass rounded-2xl p-2 shadow-2xl"
                >
                  <div className="px-3 py-2 border-b border-border mb-1">
                    <p className="text-sm font-medium truncate">{user?.name}</p>
                    <p className="text-xs text-muted truncate">{user?.email}</p>
                  </div>
                  <Link to="/dashboard/profile" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-muted hover:text-fg hover:bg-overlay/5 transition-colors">
                    <User size={15} /> Profile
                  </Link>
                  <Link to="/dashboard/settings" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-muted hover:text-fg hover:bg-overlay/5 transition-colors">
                    <Settings size={15} /> Settings
                  </Link>
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-muted hover:text-red-300 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut size={15} /> Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
