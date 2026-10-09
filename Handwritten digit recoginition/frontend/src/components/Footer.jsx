import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { FaGithub, FaXTwitter, FaLinkedin } from "react-icons/fa6";

export default function Footer() {
  return (
    <>
      <section id="about" className="relative py-20">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="glass rounded-3xl px-8 py-14 text-center relative overflow-hidden"
          >
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-80 bg-violet/20 rounded-full blur-[100px]" />
            <h2 className="font-display font-semibold text-3xl sm:text-4xl relative">
              Built by engineers, trained on 60,000 digits
            </h2>
            <p className="text-muted mt-4 max-w-xl mx-auto relative">
              DigiSense pairs a from-scratch CNN with a production-grade
              dashboard — free to use, open to extend.
            </p>
            <Link
              to="/register"
              className="relative mt-8 inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-violet via-purple to-sky text-white font-medium hover:shadow-[0_0_30px_rgba(0,212,255,0.4)] transition-shadow"
            >
              Get started free
              <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-border py-10 mt-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 font-display font-semibold">
            <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet to-cyan flex items-center justify-center text-onaccent font-mono text-xs">
              AI
            </span>
            DigiSense
          </div>

          <div className="flex items-center gap-6 text-sm text-muted">
            <a href="#home" className="hover:text-fg transition-colors">Home</a>
            <a href="#features" className="hover:text-fg transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-fg transition-colors">How it Works</a>
          </div>

          <div className="flex items-center gap-4 text-muted">
            <a href="#" aria-label="GitHub" className="hover:text-fg transition-colors"><FaGithub size={18} /></a>
            <a href="#" aria-label="Twitter" className="hover:text-fg transition-colors"><FaXTwitter size={18} /></a>
            <a href="#" aria-label="LinkedIn" className="hover:text-fg transition-colors"><FaLinkedin size={18} /></a>
          </div>
        </div>
        <div className="text-center text-xs text-muted mt-8">
          © {new Date().getFullYear()} DigiSense. All rights reserved.
        </div>
      </footer>
    </>
  );
}
