import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, FileSpreadsheet, Loader2, CheckCircle2 } from "lucide-react";
import { downloadCsvReport, downloadPdfReport } from "../../api/reports";

export default function Reports() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [downloading, setDownloading] = useState(null); // "csv" | "pdf" | null
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleDownload(type) {
    setError("");
    setSuccess("");
    setDownloading(type);
    const params = {};
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;

    try {
      if (type === "csv") await downloadCsvReport(params);
      else await downloadPdfReport(params);
      setSuccess(`${type.toUpperCase()} downloaded.`);
    } catch (err) {
      setError(err.message || "Could not generate the report.");
    } finally {
      setDownloading(null);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-6">
        <h1 className="font-display font-semibold text-2xl">Reports</h1>
        <p className="text-muted text-sm mt-1">Export your prediction history as a PDF or CSV.</p>
      </motion.div>

      <div className="glass rounded-2xl p-6">
        <p className="text-xs text-muted uppercase tracking-widest mb-3">Date range (optional)</p>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div>
            <label className="block text-xs text-muted mb-1.5">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full bg-overlay/5 border border-border rounded-xl px-3.5 py-2 text-sm outline-none focus:border-sky/50 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1.5">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full bg-overlay/5 border border-border rounded-xl px-3.5 py-2 text-sm outline-none focus:border-sky/50 transition-colors"
            />
          </div>
        </div>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
        {success && (
          <div className="flex items-center gap-2 text-emerald-300 text-sm mb-4">
            <CheckCircle2 size={15} /> {success}
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          <button
            onClick={() => handleDownload("csv")}
            disabled={downloading !== null}
            className="glow-border glass rounded-2xl p-5 text-left hover:-translate-y-1 transition-transform disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet/20 to-sky/20 border border-overlay/10 flex items-center justify-center mb-4">
              {downloading === "csv" ? (
                <Loader2 size={17} className="text-sky animate-spin" />
              ) : (
                <FileSpreadsheet size={17} className="text-sky" />
              )}
            </div>
            <h3 className="font-display font-medium text-sm">Export as CSV</h3>
            <p className="text-muted text-xs mt-1.5">Raw data — digit, confidence, source, timestamp.</p>
          </button>

          <button
            onClick={() => handleDownload("pdf")}
            disabled={downloading !== null}
            className="glow-border glass rounded-2xl p-5 text-left hover:-translate-y-1 transition-transform disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet/20 to-sky/20 border border-overlay/10 flex items-center justify-center mb-4">
              {downloading === "pdf" ? (
                <Loader2 size={17} className="text-sky animate-spin" />
              ) : (
                <FileText size={17} className="text-sky" />
              )}
            </div>
            <h3 className="font-display font-medium text-sm">Export as PDF</h3>
            <p className="text-muted text-xs mt-1.5">Formatted report with thumbnails and a summary.</p>
          </button>
        </div>
      </div>
    </div>
  );
}
