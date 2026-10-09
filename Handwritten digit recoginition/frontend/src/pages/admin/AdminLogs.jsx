import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Info, AlertTriangle, XCircle } from "lucide-react";
import { listSystemLogs } from "../../api/admin";

const PER_PAGE = 25;

const levelStyles = {
  info: { icon: Info, className: "text-sky bg-sky/10" },
  warning: { icon: AlertTriangle, className: "text-amber-400 bg-amber-400/10" },
  error: { icon: XCircle, className: "text-red-400 bg-red-400/10" },
};

export default function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [level, setLevel] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listSystemLogs({ page, perPage: PER_PAGE, level: level || undefined });
      setLogs(data.logs);
      setTotal(data.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, level]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalPages = Math.max(Math.ceil(total / PER_PAGE), 1);

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-6">
        <h1 className="font-display font-semibold text-2xl">System logs</h1>
        <p className="text-muted text-sm mt-1">Registrations, logins, and admin actions — {total} entries.</p>
      </motion.div>

      <div className="glass rounded-2xl p-5">
        <div className="flex gap-2 mb-5">
          {["", "info", "warning", "error"].map((lvl) => (
            <button
              key={lvl || "all"}
              onClick={() => {
                setLevel(lvl);
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs capitalize transition-colors ${
                level === lvl ? "bg-overlay/10 text-fg" : "glass text-muted hover:text-fg"
              }`}
            >
              {lvl || "All"}
            </button>
          ))}
        </div>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-red-400/30 border-t-orange-400 animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <p className="text-muted text-sm text-center py-16">No log entries.</p>
        ) : (
          <div className="flex flex-col divide-y divide-border font-mono text-xs">
            {logs.map((log, i) => {
              const style = levelStyles[log.level] || levelStyles.info;
              const Icon = style.icon;
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.25, delay: i * 0.02 }}
                  className="flex items-start gap-3 py-3"
                >
                  <span className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${style.className}`}>
                    <Icon size={12} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-fg/90 break-words">{log.message}</p>
                    <p className="text-muted mt-1">
                      {log.event} · {new Date(log.created_at).toLocaleString()}
                      {log.ip_address ? ` · ${log.ip_address}` : ""}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-3.5 py-1.5 rounded-lg glass text-xs text-muted hover:text-fg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="text-xs text-muted font-mono">{page} / {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="px-3.5 py-1.5 rounded-lg glass text-xs text-muted hover:text-fg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
