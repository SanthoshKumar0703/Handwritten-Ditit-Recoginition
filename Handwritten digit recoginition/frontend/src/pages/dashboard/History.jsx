import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Trash2, PenTool, UploadCloud, ArrowUpDown, Eye } from "lucide-react";
import { listPredictions, deletePrediction } from "../../api/predictions";
import PredictionDetailModal from "../../components/history/PredictionDetailModal";

const PER_PAGE = 10;

export default function History() {
  const [predictions, setPredictions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [order, setOrder] = useState("desc");

  const [selected, setSelected] = useState(null);
  const [confirmingDelete, setConfirmingDelete] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listPredictions({
        page,
        perPage: PER_PAGE,
        q: search || undefined,
        source: sourceFilter || undefined,
        sortBy,
        order,
      });
      setPredictions(data.predictions);
      setTotal(data.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, sourceFilter, sortBy, order]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function toggleSort(field) {
    if (sortBy === field) {
      setOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setOrder("desc");
    }
    setPage(1);
  }

  async function handleDelete(id) {
    try {
      await deletePrediction(id);
      setConfirmingDelete(null);
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  }

  const totalPages = Math.max(Math.ceil(total / PER_PAGE), 1);

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-6">
        <h1 className="font-display font-semibold text-2xl">Prediction history</h1>
        <p className="text-muted text-sm mt-1">Every digit you've recognized, searchable and filterable.</p>
      </motion.div>

      <div className="glass rounded-2xl p-5">
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="relative flex-1 min-w-[180px]">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by digit (0-9)…"
              className="w-full bg-overlay/5 border border-border rounded-full pl-10 pr-4 py-2 text-sm outline-none focus:border-sky/50 transition-colors placeholder:text-muted/60"
            />
          </div>

          <select
            value={sourceFilter}
            onChange={(e) => {
              setSourceFilter(e.target.value);
              setPage(1);
            }}
            className="bg-overlay/5 border border-border rounded-full px-4 py-2 text-sm outline-none focus:border-sky/50 transition-colors"
          >
            <option value="">All sources</option>
            <option value="draw">Draw</option>
            <option value="upload">Upload</option>
          </select>

          <button
            onClick={() => toggleSort("created_at")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs transition-colors ${
              sortBy === "created_at" ? "bg-overlay/10 text-fg" : "glass text-muted hover:text-fg"
            }`}
          >
            <ArrowUpDown size={12} /> Date
          </button>
          <button
            onClick={() => toggleSort("confidence")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs transition-colors ${
              sortBy === "confidence" ? "bg-overlay/10 text-fg" : "glass text-muted hover:text-fg"
            }`}
          >
            <ArrowUpDown size={12} /> Confidence
          </button>
        </div>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-violet/30 border-t-sky animate-spin" />
          </div>
        ) : predictions.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted text-sm">No predictions match your filters yet.</p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {predictions.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
                className="flex items-center gap-4 py-3.5"
              >
                <button
                  onClick={() => setSelected(p)}
                  className="w-11 h-11 rounded-xl glass flex items-center justify-center font-mono text-lg text-sky shrink-0 hover:border-overlay/20 transition-colors"
                >
                  {p.predicted_digit}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-sm">
                    {p.source === "draw" ? (
                      <PenTool size={12} className="text-muted" />
                    ) : (
                      <UploadCloud size={12} className="text-muted" />
                    )}
                    <span className="capitalize text-muted">{p.source}</span>
                  </div>
                  <p className="text-xs text-muted mt-0.5">{new Date(p.created_at).toLocaleString()}</p>
                </div>

                <span
                  className={`font-mono text-sm shrink-0 ${
                    p.confidence > 97 ? "text-cyan" : p.confidence > 90 ? "text-sky" : "text-amber-400"
                  }`}
                >
                  {p.confidence}%
                </span>

                <button
                  onClick={() => setSelected(p)}
                  className="text-muted hover:text-fg transition-colors shrink-0"
                  aria-label="View details"
                >
                  <Eye size={16} />
                </button>

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
                    aria-label="Delete prediction"
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
            <span className="text-xs text-muted font-mono">
              {page} / {totalPages}
            </span>
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

      <PredictionDetailModal prediction={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
