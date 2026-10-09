import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Particles from "./Particles";
import HeroCanvas from "./HeroCanvas";
import ThemeToggle from "./ThemeToggle";

export default function AuthLayout({ eyebrow, title, subtitle, children, footer }) {
  return (
    <div className="relative min-h-screen bg-ink text-fg font-body grid lg:grid-cols-2">
      <Particles count={22} />

      {/* form side */}
      <div className="flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-16 relative z-10">
        <div className="flex items-center justify-between mb-12">
          <Link to="/" className="flex items-center gap-2 font-display font-semibold text-lg w-fit">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet to-cyan flex items-center justify-center text-onaccent font-mono text-sm">
              AI
            </span>
            DigiSense
          </Link>
          <ThemeToggle />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {eyebrow && (
            <span className="text-xs font-mono text-sky uppercase tracking-widest">{eyebrow}</span>
          )}
          <h1 className="font-display font-semibold text-3xl mt-3">{title}</h1>
          {subtitle && <p className="text-muted text-sm mt-2 leading-relaxed">{subtitle}</p>}

          <div className="glass rounded-2xl p-7 mt-8">{children}</div>

          {footer && <div className="mt-6 text-center text-sm text-muted">{footer}</div>}
        </motion.div>
      </div>

      {/* brand side */}
      <div className="hidden lg:flex items-center justify-center relative border-l border-border overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(var(--grid-line)_1px,transparent_1px),linear-gradient(90deg,var(--grid-line)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,black,transparent)]" />
        <div className="relative z-10 px-12">
          <HeroCanvas />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-center text-muted text-sm mt-10 max-w-sm mx-auto leading-relaxed"
          >
            A convolutional neural network trained on 60,000 handwritten
            digits — reading yours in under 80ms.
          </motion.p>
        </div>
      </div>
    </div>
  );
}
