import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, PlayCircle } from "lucide-react";
import HeroCanvas from "./HeroCanvas";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function Hero() {
  return (
    <section id="home" className="relative min-h-screen flex items-center pt-28 pb-16 overflow-hidden">
      {/* background grid + glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(var(--grid-line)_1px,transparent_1px),linear-gradient(90deg,var(--grid-line)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,black,transparent)]" />
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-violet/20 rounded-full blur-[140px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center w-full">
        <motion.div variants={container} initial="hidden" animate="show">
          <motion.div
            variants={item}
            className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs font-mono text-sky mb-6"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulseGlow" />
            CNN model · 99.3% test accuracy
          </motion.div>

          <motion.h1
            variants={item}
            className="font-display font-semibold text-4xl sm:text-5xl lg:text-6xl leading-[1.08] tracking-tight"
          >
            Recognize handwritten
            <br />
            digits using{" "}
            <span className="text-gradient">artificial intelligence</span>
          </motion.h1>

          <motion.p variants={item} className="mt-6 text-lg text-muted max-w-lg leading-relaxed">
            Draw a digit, upload a photo, or scan a page — a convolutional
            neural network trained on MNIST reads it back in real time, with
            confidence scores and a full prediction history.
          </motion.p>

          <motion.div variants={item} className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              to="/register"
              className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-violet via-purple to-sky text-white font-medium hover:shadow-[0_0_30px_rgba(0,212,255,0.4)] transition-shadow"
            >
              Try the AI
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full glass hover:border-overlay/20 transition-colors text-sm font-medium"
            >
              <PlayCircle size={18} />
              Watch demo
            </a>
          </motion.div>

          <motion.div variants={item} className="mt-12 flex items-center gap-8 text-sm">
            {[
              ["99.3%", "Accuracy"],
              ["50K+", "Predictions"],
              ["<80ms", "Inference"],
            ].map(([n, l]) => (
              <div key={l}>
                <div className="font-display font-semibold text-xl">{n}</div>
                <div className="text-muted text-xs mt-0.5">{l}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <HeroCanvas />
        </motion.div>
      </div>
    </section>
  );
}
