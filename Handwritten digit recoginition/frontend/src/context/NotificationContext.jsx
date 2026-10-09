import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { listNotifications, markNotificationRead, markAllNotificationsRead } from "../api/notifications";

const NotificationContext = createContext(null);
const PREFS_KEY = "digisense_notifications";

// Socket.IO connects to the API's origin, not the /api path itself.
const SOCKET_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");

function loadPrefs() {
  try {
    return JSON.parse(localStorage.getItem(PREFS_KEY)) || { predictions: true, reports: true, security: true };
  } catch {
    return { predictions: true, reports: true, security: true };
  }
}

// "admin" notifications (an admin changed your account) are gated by the
// same "security" preference — they're about account security, not a
// separate category the Settings page needs to expose.
function isEnabledForCategory(category) {
  const prefs = loadPrefs();
  if (category === "admin") return prefs.security;
  return prefs[category] !== false;
}

export function NotificationProvider({ children }) {
  const { token, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState([]);
  const [permission, setPermission] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "unsupported"
  );
  const socketRef = useRef(null);

  const requestPermission = useCallback(async () => {
    if (typeof Notification === "undefined") return "unsupported";
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const fireNativeNotification = useCallback((title, body, link, tag) => {
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return false;
    const n = new Notification(title, {
      body,
      icon: "/notification-icon.png",
      badge: "/notification-icon.png",
      tag,
    });
    n.onclick = () => {
      window.focus();
      if (link) window.location.href = link;
      n.close();
    };
    return true;
  }, []);

  const sendTestNotification = useCallback(() => {
    return fireNativeNotification(
      "Test notification",
      "If you can see this as a real popup outside the browser tab, native notifications are working correctly.",
      null,
      `test-${Date.now()}`
    );
  }, [fireNativeNotification]);

  const handleIncoming = useCallback((notification) => {
    setNotifications((current) => [notification, ...current].slice(0, 50));
    setUnreadCount((count) => count + 1);

    if (!isEnabledForCategory(notification.category)) return;

    // In-app toast — always shown when the category is enabled, regardless
    // of tab focus.
    const toastId = `${notification.id}-${Date.now()}`;
    setToasts((current) => [...current, { ...notification, toastId }]);
    setTimeout(() => dismissToast(toastId), 6000);

    // Native browser notification — this is the actual OS-level Chrome/
    // Windows toast (Notification Web API), not an in-page popup. It fires
    // even if the tab isn't focused, as long as the browser is open and
    // permission was granted.
    fireNativeNotification(notification.title, notification.message, notification.link, notification.id);
  }, [dismissToast, fireNativeNotification]);

  // Connect / disconnect the socket as auth state changes.
  useEffect(() => {
    if (!isAuthenticated || !token) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
    });
    socket.on("notification", handleIncoming);
    socketRef.current = socket;

    // Deliberately NOT auto-requesting permission here. Chrome only
    // reliably shows the permission popup when requestPermission() is
    // called from a genuine click — calling it automatically on page load
    // gets silently downgraded to a muted icon in the address bar that's
    // easy to miss entirely. The explicit "Enable" button (banner +
    // Settings) is what actually triggers the visible prompt.

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated, token, handleIncoming]);

  // Load notification history once authenticated.
  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    listNotifications({ perPage: 20 })
      .then((data) => {
        setNotifications(data.notifications);
        setUnreadCount(data.unread_count);
      })
      .catch(() => {});
  }, [isAuthenticated]);

  const markRead = useCallback(async (id) => {
    setNotifications((current) => current.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    setUnreadCount((count) => Math.max(count - 1, 0));
    try {
      await markNotificationRead(id);
    } catch {
      // best-effort — local state already reflects "read"
    }
  }, []);

  const markAllRead = useCallback(async () => {
    setNotifications((current) => current.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
    try {
      await markAllNotificationsRead();
    } catch {
      // best-effort
    }
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        toasts,
        permission,
        requestPermission,
        sendTestNotification,
        markRead,
        markAllRead,
        dismissToast,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within a NotificationProvider");
  return ctx;
}
