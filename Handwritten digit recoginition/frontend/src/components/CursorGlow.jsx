import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CursorGlow() {
  const [visible, setVisible] = useState(false);
  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const sx = useSpring(x, { stiffness: 60, damping: 20, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 60, damping: 20, mass: 0.5 });

  useEffect(() => {
    const move = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
      if (!visible) setVisible(true);
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [x, y, visible]);

  return (
    <motion.div
      className="pointer-events-none fixed top-0 left-0 w-[420px] h-[420px] rounded-full -z-0 hidden lg:block"
      style={{
        translateX: sx,
        translateY: sy,
        x: "-50%",
        y: "-50%",
        background:
          "radial-gradient(circle, rgba(108,99,255,0.10) 0%, rgba(0,212,255,0.04) 45%, transparent 70%)",
        opacity: visible ? 1 : 0,
      }}
    />
  );
}
