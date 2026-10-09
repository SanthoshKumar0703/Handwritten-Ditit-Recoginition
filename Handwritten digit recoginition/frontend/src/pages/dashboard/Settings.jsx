import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Sun, Moon, Bell, BellOff, BellRing, Shield, Mail, ArrowRight, Send, CheckCircle2 } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useNotifications } from "../../context/NotificationContext";

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`w-10 h-6 rounded-full transition-colors relative shrink-0 ${
        checked ? "bg-gradient-to-r from-violet to-sky" : "bg-overlay/10"
      }`}
      role="switch"
      aria-checked={checked}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 rounded-full shadow-sm transition-transform ${
          checked ? "translate-x-4 bg-white" : "translate-x-0.5 bg-fg"
        }`}
      />
    </button>
  );
}

const NOTIF_KEY = "digisense_notifications";
const loadNotifPrefs = () => {
  try {
    return JSON.parse(localStorage.getItem(NOTIF_KEY)) || { predictions: true, reports: true, security: true };
  } catch {
    return { predictions: true, reports: true, security: true };
  }
};

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { permission, requestPermission, sendTestNotification } = useNotifications();
  const [notifPrefs, setNotifPrefs] = useState(loadNotifPrefs);
  const [testFired, setTestFired] = useState(false);

  function handleTest() {
    const fired = sendTestNotification();
    setTestFired(fired);
    setTimeout(() => setTestFired(false), 4000);
  }

  function updateNotif(key, value) {
    const next = { ...notifPrefs, [key]: value };
    setNotifPrefs(next);
    localStorage.setItem(NOTIF_KEY, JSON.stringify(next));
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-5">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="font-display font-semibold text-2xl">Settings</h1>
        <p className="text-muted text-sm mt-1">Appearance, notifications, and security.</p>
      </motion.div>

      <div className="glass rounded-2xl p-6">
        <h2 className="font-display font-medium text-sm mb-4">Appearance</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-lg glass flex items-center justify-center">
              {theme === "dark" ? <Moon size={15} className="text-sky" /> : <Sun size={15} className="text-sky" />}
            </span>
            <div>
              <p className="text-sm">{theme === "dark" ? "Dark mode" : "Light mode"}</p>
              <p className="text-xs text-muted">Applies across the whole dashboard</p>
            </div>
          </div>
          <Toggle checked={theme === "dark"} onChange={toggleTheme} />
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <h2 className="font-display font-medium text-sm mb-1 flex items-center gap-2">
          <Bell size={15} className="text-sky" /> Notifications
        </h2>
        <p className="text-muted text-xs mb-4">
          Delivered instantly over a live connection while you're on the
          site — plus a real browser notification if you allow it below, so
          you'll see it even in another tab.
        </p>

        <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-overlay/5 mb-4">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-lg glass flex items-center justify-center">
              {permission === "granted" ? (
                <BellRing size={15} className="text-cyan" />
              ) : (
                <BellOff size={15} className="text-muted" />
              )}
            </span>
            <div>
              <p className="text-sm">Browser notifications</p>
              <p className="text-xs text-muted">
                {permission === "granted"
                  ? "Enabled — you'll get a system notification too"
                  : permission === "denied"
                  ? "Blocked — allow this site in your browser's settings to enable"
                  : permission === "unsupported"
                  ? "Not supported in this browser"
                  : "Off — in-app toasts only"}
              </p>
            </div>
          </div>
          {permission === "default" && (
            <button
              onClick={requestPermission}
              className="text-xs font-medium px-3.5 py-2 rounded-lg bg-gradient-to-r from-violet to-sky text-white shrink-0"
            >
              Enable
            </button>
          )}
          {permission === "granted" && (
            <button
              onClick={handleTest}
              className="flex items-center gap-1.5 text-xs font-medium px-3.5 py-2 rounded-lg glass hover:border-white/20 transition-colors shrink-0"
            >
              <Send size={12} /> Send test
            </button>
          )}
        </div>

        {testFired && (
          <div className="flex items-center gap-2 text-emerald-300 text-xs mb-4 px-1">
            <CheckCircle2 size={13} />
            Test sent — if a popup didn't appear outside this browser tab within a second or two, see the
            troubleshooting note below.
          </div>
        )}

        <div className="flex flex-col gap-4">
          {[
            ["predictions", "Prediction complete", "Notify when a prediction finishes"],
            ["reports", "Report ready", "Notify when an export finishes generating"],
            ["security", "Security alerts", "Password changes, profile updates, and admin actions on your account"],
          ].map(([key, label, desc]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <p className="text-sm">{label}</p>
                <p className="text-xs text-muted">{desc}</p>
              </div>
              <Toggle checked={notifPrefs[key]} onChange={(v) => updateNotif(key, v)} />
            </div>
          ))}
        </div>
        <p className="text-xs text-muted mt-4">
          These toggles control what's shown as a toast/browser popup on
          this device. They don't affect your notification history — every
          event is still saved and visible in the bell menu.
        </p>

        {permission === "granted" && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted leading-relaxed">
              <span className="text-fg font-medium">Permission is granted but no popup appears? </span>
              That's almost always Windows suppressing it, not this site. Check, in order:
            </p>
            <ol className="text-xs text-muted mt-2 ml-4 list-decimal space-y-1">
              <li>Windows Settings → System → Notifications → make sure <strong className="text-fg">Google Chrome</strong> is turned on</li>
              <li>Windows Settings → System → Focus assist → set to <strong className="text-fg">Off</strong> (Priority/Alarms-only modes silently block toasts)</li>
              <li>Try clicking "Send test" above right after switching to a different app — some setups only suppress the popup while Chrome is the focused window</li>
            </ol>
          </div>
        )}
      </div>

      <div className="glass rounded-2xl p-6">
        <h2 className="font-display font-medium text-sm mb-4 flex items-center gap-2">
          <Shield size={15} className="text-sky" /> Security
        </h2>
        <Link
          to="/dashboard/profile"
          className="flex items-center justify-between px-4 py-3 rounded-xl bg-overlay/5 hover:bg-overlay/8 transition-colors text-sm"
        >
          Change password
          <ArrowRight size={15} className="text-muted" />
        </Link>
      </div>

      <div className="glass rounded-2xl p-6">
        <h2 className="font-display font-medium text-sm mb-3 flex items-center gap-2">
          <Mail size={15} className="text-sky" /> SMTP configuration
        </h2>
        <p className="text-muted text-xs leading-relaxed">
          Password-reset emails are sent through the SMTP server configured
          server-side by whoever deployed DigiSense (see the backend's
          <code className="mx-1 px-1.5 py-0.5 rounded bg-overlay/10 font-mono text-[11px]">.env</code>
          file). This isn't something end users configure from the app —
          it's an infrastructure setting, the same way it works on Gmail,
          Stripe, or GitHub.
        </p>
      </div>
    </div>
  );
}
