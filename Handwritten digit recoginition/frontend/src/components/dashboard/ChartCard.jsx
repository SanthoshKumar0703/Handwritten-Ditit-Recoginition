import { motion } from "framer-motion";

export default function ChartCard({ title, subtitle, children, delay = 0, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`glass rounded-2xl p-5 ${className}`}
    >
      <div className="mb-4">
        <h3 className="font-display font-medium text-sm">{title}</h3>
        {subtitle && <p className="text-muted text-xs mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </motion.div>
  );
}
