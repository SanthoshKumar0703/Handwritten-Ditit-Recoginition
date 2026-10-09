import { useEffect, useRef, useState } from "react";
import { motion, useInView, animate } from "framer-motion";

export default function StatCard({ icon: Icon, label, value, suffix = "", decimals = 0, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration: 1.2,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(v),
    });
    return controls.stop;
  }, [inView, value]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="glass rounded-2xl p-5 hover:-translate-y-1 transition-transform duration-300"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-muted text-sm">{label}</span>
        {Icon && (
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet/20 to-sky/20 border border-overlay/10 flex items-center justify-center">
            <Icon size={15} className="text-sky" />
          </span>
        )}
      </div>
      <div className="font-display font-semibold text-2xl sm:text-3xl">
        {display.toFixed(decimals)}
        {suffix}
      </div>
    </motion.div>
  );
}
