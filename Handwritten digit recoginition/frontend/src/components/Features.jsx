import { motion } from "framer-motion";
import { PenTool, UploadCloud, History, BarChart3, FileDown, Brain } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Recognition",
    desc: "A CNN trained on MNIST reads any handwritten digit in real time, right down to the confidence score.",
  },
  {
    icon: PenTool,
    title: "Draw a Digit",
    desc: "Sketch directly on a canvas with mouse or touch — the model reads your stroke the moment you lift the pen.",
  },
  {
    icon: UploadCloud,
    title: "Upload an Image",
    desc: "Drag in a PNG or JPG and let the preprocessing pipeline crop, center, and normalize it automatically.",
  },
  {
    icon: History,
    title: "Prediction History",
    desc: "Every prediction is saved with its image, confidence, and timestamp — searchable and filterable.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    desc: "Track accuracy trends, most-predicted digits, and daily activity across animated, live-updating charts.",
  },
  {
    icon: FileDown,
    title: "Export Reports",
    desc: "Generate polished PDF or CSV reports of your prediction history, ready to share or archive.",
  },
];

export default function Features() {
  return (
    <section id="features" className="relative py-24">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-xl mb-14"
        >
          <span className="text-xs font-mono text-sky uppercase tracking-widest">Capabilities</span>
          <h2 className="font-display font-semibold text-3xl sm:text-4xl mt-3">
            Everything the model needs to see, learn, and tell you
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
              className="glow-border glass rounded-2xl p-7 group hover:-translate-y-1.5 transition-transform duration-300"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet/20 to-sky/20 border border-overlay/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <f.icon size={20} className="text-sky" />
              </div>
              <h3 className="font-display font-medium text-lg mb-2">{f.title}</h3>
              <p className="text-muted text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
