import { motion } from "framer-motion";
import { Clock, Gauge } from "lucide-react";

export default function PredictionResult({ prediction }) {
  if (!prediction) {
    return (
      <div className="glass rounded-2xl h-full min-h-[320px] flex items-center justify-center p-6">
        <p className="text-muted text-sm text-center">
          Your prediction, confidence score, and top matches will show up here.
        </p>
      </div>
    );
  }

  const { predicted_digit, confidence, top_predictions, processing_time_ms } = prediction;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass rounded-2xl p-6 h-full flex flex-col"
    >
      <div className="text-center mb-6">
        <span className="text-xs font-mono text-muted uppercase tracking-widest">Predicted digit</span>
        <div className="font-display font-semibold text-7xl text-gradient mt-2">{predicted_digit}</div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="glass rounded-xl p-3.5">
          <div className="flex items-center gap-1.5 text-muted text-xs mb-1">
            <Gauge size={12} /> Confidence
          </div>
          <div className="font-mono text-lg text-cyan">{confidence}%</div>
        </div>
        <div className="glass rounded-xl p-3.5">
          <div className="flex items-center gap-1.5 text-muted text-xs mb-1">
            <Clock size={12} /> Processing time
          </div>
          <div className="font-mono text-lg">{processing_time_ms}ms</div>
        </div>
      </div>

      <div className="flex-1">
        <p className="text-xs text-muted uppercase tracking-widest mb-3">Top 3 predictions</p>
        <div className="flex flex-col gap-3">
          {top_predictions.map((p, i) => (
            <div key={p.digit}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className={i === 0 ? "text-fg font-medium" : "text-muted"}>Digit {p.digit}</span>
                <span className="font-mono text-xs text-muted">{p.confidence}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-overlay/5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${p.confidence}%` }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className={`h-full rounded-full ${
                    i === 0 ? "bg-gradient-to-r from-violet to-cyan" : "bg-overlay/20"
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
