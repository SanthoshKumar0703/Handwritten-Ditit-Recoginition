import { motion } from "framer-motion";
import { PenTool, UploadCloud, Cpu, Sparkles, Save } from "lucide-react";

const steps = [
  { icon: PenTool, title: "Draw digit", desc: "Sketch on the canvas" },
  { icon: UploadCloud, title: "Upload image", desc: "or drop in a photo" },
  { icon: Cpu, title: "AI processing", desc: "CNN reads the pixels" },
  { icon: Sparkles, title: "Prediction", desc: "Digit + confidence" },
  { icon: Save, title: "History saved", desc: "Logged automatically" },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-xl mb-16"
        >
          <span className="text-xs font-mono text-sky uppercase tracking-widest">Process</span>
          <h2 className="font-display font-semibold text-3xl sm:text-4xl mt-3">
            From stroke to prediction in five steps
          </h2>
        </motion.div>

        <div className="relative">
          <div className="hidden lg:block absolute top-8 left-0 right-0 h-px bg-gradient-to-r from-violet/0 via-violet/40 to-cyan/0" />
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-4">
            {steps.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="relative flex flex-col items-center text-center"
              >
                <div className="relative z-10 w-16 h-16 rounded-2xl glass flex items-center justify-center mb-4">
                  <s.icon size={22} className="text-sky" />
                  <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-ink border border-border text-[10px] font-mono flex items-center justify-center text-muted">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-display font-medium text-sm">{s.title}</h3>
                <p className="text-muted text-xs mt-1">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
