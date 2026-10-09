import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Gauge, PenTool, UploadCloud } from "lucide-react";

export default function PredictionDetailModal({ prediction, onClose }) {
  return (
    <AnimatePresence>
      {prediction && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
        >
          <div className="absolute inset-0 bg-black/70" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative glass rounded-2xl p-6 w-full max-w-sm"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-muted hover:text-fg transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="flex flex-col items-center text-center">
              {prediction.image_data && (
                <img
                  src={prediction.image_data}
                  alt={`Digit ${prediction.predicted_digit}`}
                  className="w-24 h-24 rounded-xl border border-border bg-[#0a0a12] mb-4"
                  style={{ imageRendering: "pixelated" }}
                />
              )}
              <div className="font-display font-semibold text-5xl text-gradient">
                {prediction.predicted_digit}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted mt-2">
                {prediction.source === "draw" ? <PenTool size={12} /> : <UploadCloud size={12} />}
                {prediction.source}
                <span>·</span>
                {new Date(prediction.created_at).toLocaleString()}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className="glass rounded-xl p-3.5">
                <div className="flex items-center gap-1.5 text-muted text-xs mb-1">
                  <Gauge size={12} /> Confidence
                </div>
                <div className="font-mono text-lg text-cyan">{prediction.confidence}%</div>
              </div>
              <div className="glass rounded-xl p-3.5">
                <div className="flex items-center gap-1.5 text-muted text-xs mb-1">
                  <Clock size={12} /> Processing
                </div>
                <div className="font-mono text-lg">{prediction.processing_time_ms}ms</div>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-xs text-muted uppercase tracking-widest mb-3">Top 3 predictions</p>
              <div className="flex flex-col gap-3">
                {prediction.top_predictions.map((p, i) => (
                  <div key={p.digit}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className={i === 0 ? "text-fg font-medium" : "text-muted"}>
                        Digit {p.digit}
                      </span>
                      <span className="font-mono text-xs text-muted">{p.confidence}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-overlay/5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          i === 0 ? "bg-gradient-to-r from-violet to-cyan" : "bg-overlay/20"
                        }`}
                        style={{ width: `${p.confidence}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
