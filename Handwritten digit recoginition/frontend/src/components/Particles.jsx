import { useMemo } from "react";

export default function Particles({ count = 36 }) {
  const dots = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 2 + 1,
        duration: Math.random() * 10 + 10,
        delay: Math.random() * 8,
      })),
    [count]
  );

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {dots.map((d) => (
        <span
          key={d.id}
          className="absolute rounded-full bg-sky/40"
          style={{
            left: `${d.left}%`,
            top: `${d.top}%`,
            width: d.size,
            height: d.size,
            animation: `drift ${d.duration}s ease-in-out ${d.delay}s infinite alternate`,
          }}
        />
      ))}
      <style>{`
        @keyframes drift {
          from { transform: translate(0, 0); opacity: 0.15; }
          50% { opacity: 0.6; }
          to { transform: translate(30px, -40px); opacity: 0.15; }
        }
      `}</style>
    </div>
  );
}
