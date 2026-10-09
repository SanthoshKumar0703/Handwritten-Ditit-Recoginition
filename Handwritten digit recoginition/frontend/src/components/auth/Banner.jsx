import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export default function Banner({ type = "error", message }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, height: 0, marginBottom: 0 }}
          animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          className={`flex items-start gap-2 rounded-xl px-4 py-3 text-sm ${
            type === "error"
              ? "bg-red-500/10 border border-red-500/30 text-red-300"
              : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
          }`}
        >
          {type === "error" ? (
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
          ) : (
            <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
          )}
          <span>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
