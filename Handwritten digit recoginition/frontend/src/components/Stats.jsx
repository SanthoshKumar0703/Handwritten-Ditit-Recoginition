import { useEffect, useRef, useState } from "react";
import { motion, useInView, animate } from "framer-motion";

const stats = [
  { value: 99.3, suffix: "%", label: "Model Accuracy" },
  { value: 50, suffix: "K+", label: "Predictions Made" },
  { value: 10, suffix: "K+", label: "Registered Users" },
  { value: 98, suffix: "%", label: "Customer Satisfaction" },
];

function Counter({ value, suffix }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration: 1.6,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(v),
    });
    return controls.stop;
  }, [inView, value]);

  return (
    <span ref={ref} className="font-display font-semibold text-4xl sm:text-5xl text-gradient">
      {value % 1 === 0 ? Math.round(display) : display.toFixed(1)}
      {suffix}
    </span>
  );
}

export default function Stats() {
  return (
    <section className="relative py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass rounded-2xl p-6 text-center hover:-translate-y-1 transition-transform duration-300"
            >
              <Counter value={s.value} suffix={s.suffix} />
              <div className="text-muted text-sm mt-2">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
