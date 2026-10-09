import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BellRing, X } from "lucide-react";
import { useNotifications } from "../context/NotificationContext";

export default function NotificationPermissionBanner() {
  const { permission, requestPermission } = useNotifications();
  const [dismissed, setDismissed] = useState(false);

  const shouldShow = !dismissed && (permission === "default" || permission === "denied");

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <div className="glass rounded-2xl p-4 mb-5 flex items-center gap-3 flex-wrap">
            <span className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet/20 to-sky/20 border border-white/10 flex items-center justify-center shrink-0">
              <BellRing size={16} className="text-sky" />
            </span>

            <div className="flex-1 min-w-[200px]">
              {permission === "default" ? (
                <>
                  <p className="text-sm font-medium">Turn on browser notifications</p>
                  <p className="text-xs text-muted mt-0.5">
                    Get a real Chrome/Windows notification the moment a prediction, report, or account change happens — even in another tab.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium">Notifications are blocked for this site</p>
                  <p className="text-xs text-muted mt-0.5">
                    Click the lock/info icon in your address bar → Site settings → Notifications → Allow, then refresh this page.
                  </p>
                </>
              )}
            </div>

            {permission === "default" && (
              <button
                onClick={requestPermission}
                className="text-xs font-medium px-4 py-2 rounded-full bg-gradient-to-r from-violet to-sky text-white shrink-0"
              >
                Enable
              </button>
            )}
            <button
              onClick={() => setDismissed(true)}
              className="text-muted hover:text-fg transition-colors shrink-0"
              aria-label="Dismiss"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
