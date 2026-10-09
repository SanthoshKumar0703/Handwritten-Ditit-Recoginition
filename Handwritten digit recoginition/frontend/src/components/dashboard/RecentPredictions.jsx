import { motion } from "framer-motion";
import { PenTool, UploadCloud } from "lucide-react";

export default function RecentPredictions({ predictions }) {
  return (
    <div className="flex flex-col divide-y divide-border">
      {predictions.map((p, i) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, delay: i * 0.05 }}
          className="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
        >
          <span className="w-10 h-10 rounded-xl glass flex items-center justify-center font-mono text-lg text-sky shrink-0">
            {p.digit}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-sm">
              {p.source === "Draw" ? (
                <PenTool size={12} className="text-muted" />
              ) : (
                <UploadCloud size={12} className="text-muted" />
              )}
              <span className="text-muted">{p.source}</span>
            </div>
            <p className="text-xs text-muted mt-0.5">{p.time}</p>
          </div>
          <div className="text-right shrink-0">
            <span
              className={`font-mono text-sm ${
                p.confidence > 97 ? "text-cyan" : p.confidence > 90 ? "text-sky" : "text-amber-400"
              }`}
            >
              {p.confidence}%
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
