import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
}

interface SparkleParticlesProps {
  isActive: boolean;
  className?: string;
}

const COLORS = [
  "rgb(139, 92, 246)", // violet-500
  "rgb(168, 85, 247)", // purple-500
  "rgb(251, 191, 36)", // amber-400
  "rgb(236, 72, 153)", // pink-500
  "rgb(59, 130, 246)", // blue-500
];

export function SparkleParticles({ isActive, className }: SparkleParticlesProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  const generateParticles = useCallback(() => {
    const newParticles: Particle[] = [];
    const count = 12;
    
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: Date.now() + i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 6 + 3,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        duration: Math.random() * 1.5 + 1,
        delay: Math.random() * 0.5,
      });
    }
    
    setParticles(newParticles);
  }, []);

  useEffect(() => {
    if (isActive) {
      generateParticles();
      const interval = setInterval(generateParticles, 2000);
      return () => clearInterval(interval);
    } else {
      setParticles([]);
    }
  }, [isActive, generateParticles]);

  if (!isActive) return null;

  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-sparkle-float"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            borderRadius: "50%",
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
      
      {/* Star shapes */}
      {particles.slice(0, 5).map((particle, i) => (
        <svg
          key={`star-${particle.id}`}
          className="absolute animate-sparkle-spin"
          style={{
            left: `${(particle.x + 20) % 100}%`,
            top: `${(particle.y + 30) % 100}%`,
            width: particle.size + 4,
            height: particle.size + 4,
            animationDuration: `${particle.duration * 1.5}s`,
            animationDelay: `${particle.delay + 0.2}s`,
          }}
          viewBox="0 0 24 24"
          fill={COLORS[(i + 2) % COLORS.length]}
        >
          <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" />
        </svg>
      ))}
    </div>
  );
}