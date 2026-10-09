import { motion } from "framer-motion";

export default function ActivityTimeline({ items }) {
  return (
    <div className="relative pl-5">
      <div className="absolute left-[7px] top-1 bottom-1 w-px bg-border" />
      <div className="flex flex-col gap-5">
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: i * 0.06 }}
            className="relative"
          >
            <span className="absolute -left-5 top-1 w-3 h-3 rounded-full bg-gradient-to-br from-violet to-sky ring-4 ring-ink" />
            <p className="text-sm">{item.label}</p>
            <p className="text-xs text-muted mt-0.5">
              {item.meta} · {item.time}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
