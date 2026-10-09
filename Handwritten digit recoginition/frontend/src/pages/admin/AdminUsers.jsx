import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Shield, ShieldOff, Trash2, Ban, CheckCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { listAllUsers, updateUser, deleteUser } from "../../api/admin";

const PER_PAGE = 10;

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listAllUsers({ page, perPage: PER_PAGE, q: search || undefined });
      setUsers(data.users);
      setTotal(data.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function toggleAdmin(u) {
    try {
      await updateUser(u.id, { is_admin: !u.is_admin });
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function toggleActive(u) {
    try {
      await updateUser(u.id, { is_active: !u.is_active });
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteUser(id);
      setConfirmingDelete(null);
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  }

  const totalPages = Math.max(Math.ceil(total / PER_PAGE), 1);

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-6">
        <h1 className="font-display font-semibold text-2xl">Users</h1>
        <p className="text-muted text-sm mt-1">{total} registered account{total === 1 ? "" : "s"}.</p>
      </motion.div>

      <div className="glass rounded-2xl p-5">
        <div className="relative mb-5 max-w-sm">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name or email…"
            className="w-full bg-overlay/5 border border-border rounded-full pl-10 pr-4 py-2 text-sm outline-none focus:border-sky/50 transition-colors placeholder:text-muted/60"
          />
        </div>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-red-400/30 border-t-orange-400 animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {users.map((u, i) => (
              <motion.div
                key={u.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
                className="flex flex-wrap items-center gap-3 py-3.5"
              >
                <span className="w-9 h-9 rounded-full bg-gradient-to-br from-violet to-sky flex items-center justify-center text-onaccent text-xs font-semibold shrink-0">
                  {u.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()}
                </span>
                <div className="flex-1 min-w-[160px]">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{u.name}</p>
                    {u.is_admin && (
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-orange-400/20 text-orange-300">
                        admin
                      </span>
                    )}
                    {!u.is_active && (
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-red-500/20 text-red-300">
                        disabled
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted mt-0.5">{u.email}</p>
                </div>
                <span className="text-xs text-muted font-mono shrink-0">{u.prediction_count} predictions</span>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => toggleAdmin(u)}
                    disabled={u.id === currentUser?.id}
                    title={u.is_admin ? "Remove admin" : "Make admin"}
                    className="w-8 h-8 rounded-lg glass flex items-center justify-center text-muted hover:text-fg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    {u.is_admin ? <ShieldOff size={14} /> : <Shield size={14} />}
                  </button>
                  <button
                    onClick={() => toggleActive(u)}
                    disabled={u.id === currentUser?.id}
                    title={u.is_active ? "Disable account" : "Enable account"}
                    className="w-8 h-8 rounded-lg glass flex items-center justify-center text-muted hover:text-fg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    {u.is_active ? <Ban size={14} /> : <CheckCircle size={14} />}
                  </button>

                  {confirmingDelete === u.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="text-xs px-2.5 py-1.5 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setConfirmingDelete(null)}
                        className="text-xs px-2.5 py-1.5 rounded-lg glass text-muted hover:text-fg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmingDelete(u.id)}
                      disabled={u.id === currentUser?.id}
                      className="w-8 h-8 rounded-lg glass flex items-center justify-center text-muted hover:text-red-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
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
