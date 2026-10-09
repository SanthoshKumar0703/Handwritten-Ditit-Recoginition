import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const links = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "How it Works", href: "#how-it-works" },
  { label: "About", href: "#about" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-ink/70 backdrop-blur-xl border-b border-border" : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2 font-display font-semibold text-lg">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet to-cyan flex items-center justify-center text-onaccent font-mono text-sm">
            AI
          </span>
          DigiSense
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm text-muted">
          {links.map((l) => (
            <a key={l.label} href={l.href} className="hover:text-fg transition-colors">
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <Link to="/login" className="text-sm text-muted hover:text-fg transition-colors px-4 py-2">
            Log in
          </Link>
          <Link
            to="/register"
            className="text-sm font-medium px-5 py-2.5 rounded-full bg-gradient-to-r from-violet to-sky text-white hover:shadow-[0_0_24px_rgba(108,99,255,0.5)] transition-shadow"
          >
            Get Started
          </Link>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button className="text-fg" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="md:hidden bg-ink/95 border-t border-border px-6 py-4 flex flex-col gap-4"
        >
          {links.map((l) => (
            <a key={l.label} href={l.href} className="text-muted" onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
          <Link to="/login" className="text-fg">Log in</Link>
          <Link to="/register" className="text-center px-5 py-2.5 rounded-full bg-gradient-to-r from-violet to-sky text-white">
            Get Started
          </Link>
        </motion.div>
      )}
    </motion.header>
  );
}
