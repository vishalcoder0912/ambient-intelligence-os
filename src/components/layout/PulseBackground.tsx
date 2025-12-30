import { useEffect, useRef } from "react";

interface PulseBackgroundProps {
  intensity?: "calm" | "moderate" | "intense";
}

export function PulseBackground({ intensity = "calm" }: PulseBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const colors = {
      calm: { primary: "#00d4ff", secondary: "#7c3aed" },
      moderate: { primary: "#7c3aed", secondary: "#ec4899" },
      intense: { primary: "#ec4899", secondary: "#f43f5e" },
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const draw = () => {
      time += 0.003;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const { primary, secondary } = colors[intensity];
      
      // Create flowing gradients
      for (let i = 0; i < 3; i++) {
        const x = canvas.width * (0.3 + Math.sin(time + i * 2) * 0.2);
        const y = canvas.height * (0.3 + Math.cos(time * 0.7 + i * 1.5) * 0.2);
        const radius = 300 + Math.sin(time + i) * 100;

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, `${primary}15`);
        gradient.addColorStop(0.5, `${secondary}08`);
        gradient.addColorStop(1, "transparent");

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Add subtle particles
      ctx.fillStyle = `${primary}20`;
      for (let i = 0; i < 20; i++) {
        const x = (Math.sin(time * 0.5 + i * 0.8) * 0.5 + 0.5) * canvas.width;
        const y = (Math.cos(time * 0.3 + i * 1.2) * 0.5 + 0.5) * canvas.height;
        const size = 2 + Math.sin(time + i) * 1;
        
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      animationId = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, [intensity]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 opacity-60"
    />
  );
}
