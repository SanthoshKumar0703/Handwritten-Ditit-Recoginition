import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, HardDrive, Clock, Layers } from "lucide-react";
import { getModelStats } from "../../api/admin";

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
}

export default function AdminModelStats() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getModelStats().then(setData).catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="text-red-400 text-sm text-center py-16">{error}</p>;
  if (!data) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-8 h-8 rounded-full border-2 border-red-400/30 border-t-orange-400 animate-spin" />
      </div>
    );
  }

  const evaluation = data.evaluation;

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-6">
        <h1 className="font-display font-semibold text-2xl">Model statistics</h1>
        <p className="text-muted text-sm mt-1">The CNN's evaluation results from its last training run.</p>
      </motion.div>

      <div className="grid sm:grid-cols-3 gap-4 mb-5">
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-1.5 text-muted text-xs mb-2">
            {data.model_loaded ? <CheckCircle2 size={13} className="text-emerald-400" /> : <XCircle size={13} className="text-red-400" />}
            Status
          </div>
          <p className="text-sm font-medium">{data.model_loaded ? "Loaded & serving" : "Not loaded"}</p>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-1.5 text-muted text-xs mb-2">
            <HardDrive size={13} /> Model size
          </div>
          <p className="text-sm font-medium">{formatBytes(data.model_size_bytes)}</p>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-1.5 text-muted text-xs mb-2">
            <Clock size={13} /> Training time
          </div>
          <p className="text-sm font-medium">
            {evaluation ? `${Math.round(evaluation.training_seconds / 60)} min` : "—"}
          </p>
        </div>
      </div>

      {evaluation ? (
        <>
          <div className="glass rounded-2xl p-6 mb-5">
            <p className="text-xs text-muted uppercase tracking-widest mb-4">Test set evaluation</p>
            <div className="grid sm:grid-cols-3 gap-6">
              <div>
                <p className="font-display font-semibold text-3xl text-gradient">
                  {(evaluation.test_accuracy * 100).toFixed(2)}%
                </p>
                <p className="text-xs text-muted mt-1">Test accuracy</p>
              </div>
              <div>
                <p className="font-display font-semibold text-3xl">{evaluation.test_loss.toFixed(4)}</p>
                <p className="text-xs text-muted mt-1">Test loss</p>
              </div>
              <div>
                <p className="font-display font-semibold text-3xl">{evaluation.epochs_run}</p>
                <p className="text-xs text-muted mt-1">Epochs (early-stopped)</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted mt-5">
              <Layers size={12} />
              Trained on {evaluation.train_samples.toLocaleString()} images · tested on{" "}
              {evaluation.test_samples.toLocaleString()}
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <p className="text-xs text-muted uppercase tracking-widest mb-4">Per-digit accuracy</p>
            <div className="flex flex-col gap-3">
              {Object.entries(evaluation.per_class_accuracy).map(([digit, acc], i) => (
                <div key={digit}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>Digit {digit}</span>
                    <span className="font-mono text-xs text-muted">{(acc * 100).toFixed(2)}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-overlay/5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${acc * 100}%` }}
                      transition={{ duration: 0.6, delay: i * 0.04 }}
                      className="h-full rounded-full bg-gradient-to-r from-violet to-cyan"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="glass rounded-2xl p-8 text-center">
          <p className="text-muted text-sm">
            No evaluation report found — run <code className="px-1.5 py-0.5 rounded bg-overlay/10 font-mono text-xs">python ml/train_model.py</code> to generate one.
          </p>
        </div>
      )}
    </div>
  );
}
