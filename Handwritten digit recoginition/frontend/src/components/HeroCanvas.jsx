import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

// Node positions for a small feed-forward network (input -> hidden -> output)
const inputNodes = [0, 1, 2, 3, 4].map((i) => ({ x: 40, y: 40 + i * 45 }));
const hiddenNodes = [0, 1, 2, 3].map((i) => ({ x: 220, y: 60 + i * 60 }));
const outputNodes = [0, 1, 2].map((i) => ({ x: 400, y: 100 + i * 65 }));

const links = [];
inputNodes.forEach((_, i) =>
  hiddenNodes.forEach((__, j) => links.push({ from: inputNodes[i], to: hiddenNodes[j], key: `ih-${i}-${j}` }))
);
hiddenNodes.forEach((_, i) =>
  outputNodes.forEach((__, j) => links.push({ from: hiddenNodes[i], to: outputNodes[j], key: `ho-${i}-${j}` }))
);

const floatingDigits = [
  { char: "7", top: "8%", left: "4%", delay: 0 },
  { char: "3", top: "68%", left: "2%", delay: 0.6 },
  { char: "9", top: "80%", left: "70%", delay: 1.1 },
  { char: "4", top: "4%", left: "78%", delay: 1.6 },
];

export default function HeroCanvas() {
  const ref = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-40, 40], [8, -8]), { stiffness: 80, damping: 20 });
  const rotateY = useSpring(useTransform(mx, [-40, 40], [-8, 8]), { stiffness: 80, damping: 20 });

  function handleMove(e) {
    const rect = ref.current.getBoundingClientRect();
    mx.set(e.clientX - rect.left - rect.width / 2);
    my.set(e.clientY - rect.top - rect.height / 2);
  }
  function handleLeave() {
    mx.set(0);
    my.set(0);
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="relative w-full aspect-square max-w-[520px] mx-auto"
      style={{ perspective: 1000 }}
    >
      {/* ambient glows */}
      <div className="absolute -top-10 -left-10 w-72 h-72 bg-violet/30 rounded-full blur-[100px] animate-pulseGlow" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-cyan/20 rounded-full blur-[100px] animate-pulseGlow" style={{ animationDelay: "1s" }} />

      {/* floating digit chips */}
      {floatingDigits.map((d) => (
        <motion.div
          key={d.char}
          className="absolute glass rounded-2xl w-14 h-14 flex items-center justify-center font-mono text-2xl text-sky/90 animate-float"
          style={{ top: d.top, left: d.left, animationDelay: `${d.delay}s` }}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: d.delay, duration: 0.6 }}
        >
          {d.char}
        </motion.div>
      ))}

      {/* tilting neural net card */}
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative glass rounded-3xl w-full h-full flex items-center justify-center overflow-hidden shadow-[0_0_60px_-15px_rgba(108,99,255,0.35)]"
      >
        {/* scanning sweep */}
        <motion.div
          className="absolute left-0 right-0 h-24 bg-gradient-to-b from-transparent via-cyan/20 to-transparent pointer-events-none"
          animate={{ top: ["-10%", "110%"] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "linear" }}
        />

        <svg viewBox="0 0 460 300" className="w-[92%] h-[92%]">
          <defs>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#6C63FF" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#00D4FF" stopOpacity="0.5" />
            </linearGradient>
          </defs>

          {links.map((l) => (
            <line
              key={l.key}
              x1={l.from.x}
              y1={l.from.y}
              x2={l.to.x}
              y2={l.to.y}
              stroke="url(#lineGrad)"
              strokeWidth="1"
            />
          ))}

          {[inputNodes, hiddenNodes, outputNodes].flat().map((n, i) => (
            <circle
              key={i}
              cx={n.x}
              cy={n.y}
              r={5}
              fill="#0a0a12"
              stroke={i % 3 === 0 ? "#3ABEFF" : "#7F5AF0"}
              strokeWidth="2"
            >
              <animate
                attributeName="r"
                values="5;7;5"
                dur={`${1.8 + (i % 5) * 0.3}s`}
                repeatCount="indefinite"
              />
            </circle>
          ))}

          {/* recognized output label */}
          <text x="430" y="150" textAnchor="middle" className="fill-cyan" fontSize="26" fontFamily="'JetBrains Mono', monospace" fontWeight="600">
            7
          </text>
        </svg>
      </motion.div>

      {/* confidence readout */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute -bottom-5 left-1/2 -translate-x-1/2 glass rounded-full px-5 py-2 flex items-center gap-2 text-sm font-mono"
      >
        <span className="w-2 h-2 rounded-full bg-cyan animate-pulseGlow" />
        <span className="text-muted">confidence</span>
        <span className="text-gradient font-semibold">99.3%</span>
      </motion.div>
    </div>
  );
}
