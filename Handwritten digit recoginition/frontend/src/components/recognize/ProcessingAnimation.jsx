import { motion, AnimatePresence } from "framer-motion";
import { Cpu, AlertCircle, Sparkles } from "lucide-react";

export default function ProcessingAnimation({ status, errorMessage }) {
  return (
    <div className="glass rounded-2xl h-full min-h-[320px] flex items-center justify-center p-6 relative overflow-hidden">
      <AnimatePresence mode="wait">
        {status === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <Sparkles size={26} className="text-muted mx-auto mb-3" />
            <p className="text-muted text-sm">Draw or upload a digit, then hit Predict.</p>
          </motion.div>
        )}

        {status === "processing" && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative text-center"
          >
            <div className="absolute inset-0 -z-10">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-52 h-52 bg-violet/20 rounded-full blur-[80px] animate-pulseGlow" />
            </div>

            <div className="relative w-24 h-24 mx-auto mb-5">
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-transparent border-t-sky border-r-violet"
                animate={{ rotate: 360 }}
                transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-3 rounded-full border-2 border-transparent border-b-cyan"
                animate={{ rotate: -360 }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Cpu size={22} className="text-sky" />
              </div>
            </div>

            <p className="font-mono text-sm text-sky">Scanning pixels…</p>
            <p className="text-muted text-xs mt-1">Running through the CNN</p>

            <div className="flex justify-center gap-1 mt-4">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-sky"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {status === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center max-w-xs"
          >
            <AlertCircle size={26} className="text-red-400 mx-auto mb-3" />
            <p className="text-red-300 text-sm">{errorMessage || "Something went wrong."}</p>
          </motion.div>
        )}

        {status === "done" && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet to-cyan flex items-center justify-center mx-auto mb-3">
              <Sparkles size={20} className="text-onaccent" />
            </div>
            <p className="text-sm text-muted">Prediction complete →</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
