import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-ink text-fg font-body flex flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="font-display font-semibold text-8xl text-gradient">404</div>
        <p className="text-muted mt-4 max-w-sm">
          The model couldn't recognize this page — it isn't in the dataset.
        </p>
        <Link
          to="/"
          className="inline-flex mt-8 px-6 py-3 rounded-full bg-gradient-to-r from-violet via-purple to-sky text-white text-sm font-medium hover:shadow-[0_0_24px_rgba(0,212,255,0.35)] transition-shadow"
        >
          Back to home
        </Link>
      </motion.div>
    </div>
  );
}
