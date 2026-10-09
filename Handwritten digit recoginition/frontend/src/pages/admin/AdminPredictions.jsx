import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trash2, PenTool, UploadCloud } from "lucide-react";
import { listAllPredictions, adminDeletePrediction } from "../../api/admin";

const PER_PAGE = 12;

export default function AdminPredictions() {
  const [predictions, setPredictions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listAllPredictions({ page, perPage: PER_PAGE });
      setPredictions(data.predictions);
      setTotal(data.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleDelete(id) {
    try {
      await adminDeletePrediction(id);
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
        <h1 className="font-display font-semibold text-2xl">Predictions</h1>
        <p className="text-muted text-sm mt-1">{total} prediction{total === 1 ? "" : "s"} across every account.</p>
      </motion.div>

      <div className="glass rounded-2xl p-5">
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-red-400/30 border-t-orange-400 animate-spin" />
          </div>
        ) : predictions.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted text-sm">No predictions on the platform yet.</p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {predictions.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.02 }}
                className="flex items-center gap-4 py-3.5"
              >
                <span className="w-10 h-10 rounded-xl glass flex items-center justify-center font-mono text-lg text-sky shrink-0">
                  {p.predicted_digit}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{p.user_name} <span className="text-muted">· {p.user_email}</span></p>
                  <div className="flex items-center gap-1.5 text-xs text-muted mt-0.5">
                    {p.source === "draw" ? <PenTool size={11} /> : <UploadCloud size={11} />}
                    {new Date(p.created_at).toLocaleString()}
                  </div>
                </div>
                <span
                  className={`font-mono text-sm shrink-0 ${
                    p.confidence > 97 ? "text-cyan" : p.confidence > 90 ? "text-sky" : "text-amber-400"
                  }`}
                >
                  {p.confidence}%
                </span>

                {confirmingDelete === p.id ? (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleDelete(p.id)}
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
                    onClick={() => setConfirmingDelete(p.id)}
                    className="text-muted hover:text-red-300 transition-colors shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
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
