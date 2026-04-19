"use client";

const particles = [
  { size: 1, left: "23%", top: "17%", duration: 4, delay: 0 },
  { size: 2, left: "60%", top: "70%", duration: 5, delay: 0.7 },
  { size: 3, left: "17%", top: "43%", duration: 6, delay: 1.4 },
  { size: 1, left: "54%", top: "16%", duration: 4, delay: 2.1 },
  { size: 2, left: "11%", top: "69%", duration: 5, delay: 2.8 },
  { size: 3, left: "48%", top: "42%", duration: 6, delay: 3.5 },
  { size: 1, left: "85%", top: "15%", duration: 4, delay: 4.2 },
  { size: 2, left: "42%", top: "68%", duration: 5, delay: 4.9 },
];

const orbs = [
  { size: 180, left: "25%", top: "30%", duration: 7 },
  { size: 240, left: "55%", top: "55%", duration: 9 },
];

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Base gradient */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(rgb(10, 20, 15) 0%, rgb(7, 11, 8) 50%, rgb(5, 7, 5) 100%)" }}
      />

      {/* Radial accent */}
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(circle, rgba(0, 180, 53, 0.08), transparent 60%)" }}
      />

      {/* Center pulse */}
      <div
        className="absolute w-[900px] h-[900px]"
        style={{
          left: "50%",
          top: "50%",
          marginLeft: "-450px",
          marginTop: "-450px",
          background: "radial-gradient(circle, rgba(0, 180, 53, 0.06) 0%, transparent 50%)",
          filter: "blur(80px)",
          animation: "8s ease-in-out 0s infinite normal none running bgPulse",
        }}
      />

      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: "linear-gradient(rgb(255, 255, 255) 1px, transparent 1px), linear-gradient(90deg, rgb(255, 255, 255) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      {/* Particles */}
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: "rgb(0, 255, 76)",
            left: p.left,
            top: p.top,
            boxShadow: "rgba(0, 255, 76, 0.3) 0px 0px 4px",
            animation: `${p.duration}s ease-in-out ${p.delay}s infinite normal none running particleFade`,
          }}
        />
      ))}

      {/* Orbs */}
      {orbs.map((o, i) => (
        <div
          key={`orb-${i}`}
          className="absolute rounded-full"
          style={{
            width: `${o.size}px`,
            height: `${o.size}px`,
            left: o.left,
            top: o.top,
            background: "radial-gradient(circle, rgba(0, 180, 53, 0.06), transparent 70%)",
            filter: "blur(40px)",
            animation: `${o.duration}s ease-in-out 0s infinite normal none running orbFloat`,
          }}
        />
      ))}
    </div>
  );
}
