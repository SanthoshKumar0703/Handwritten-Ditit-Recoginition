import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Sparkles, FileText, ShieldAlert, Megaphone, X } from "lucide-react";
import { useNotifications } from "../context/NotificationContext";

const categoryIcon = {
  prediction: Sparkles,
  report: FileText,
  security: ShieldAlert,
  admin: Megaphone,
};

export default function NotificationToaster() {
  const { toasts, dismissToast, markRead } = useNotifications();
  const navigate = useNavigate();

  function handleClick(toast) {
    markRead(toast.id);
    dismissToast(toast.toastId);
    if (toast.link) navigate(toast.link);
  }

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-3 w-[calc(100%-2.5rem)] max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = categoryIcon[toast.category] || Sparkles;
          return (
            <motion.div
              key={toast.toastId}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, transition: { duration: 0.2 } }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
              className="glass rounded-2xl p-4 pointer-events-auto shadow-2xl cursor-pointer"
              onClick={() => handleClick(toast)}
            >
              <div className="flex items-start gap-3">
                <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet/20 to-sky/20 border border-white/10 flex items-center justify-center shrink-0">
                  <Icon size={16} className="text-sky" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{toast.title}</p>
                  <p className="text-xs text-muted mt-0.5">{toast.message}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    dismissToast(toast.toastId);
                  }}
                  className="text-muted hover:text-fg transition-colors shrink-0"
                  aria-label="Dismiss"
                >
                  <X size={14} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
