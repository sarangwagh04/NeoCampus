import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { X, Sparkles } from "lucide-react";

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

interface Burst {
  id: number;
  x: number;
  y: number;
  particles: Particle[];
}

interface FireworksShowProps {
  onClose: () => void;
}

const COLORS = [
  "rgb(239, 68, 68)",   // red
  "rgb(249, 115, 22)",  // orange
  "rgb(234, 179, 8)",   // yellow
  "rgb(34, 197, 94)",   // green
  "rgb(59, 130, 246)",  // blue
  "rgb(168, 85, 247)",  // purple
  "rgb(236, 72, 153)",  // pink
  "rgb(20, 184, 166)",  // teal
];

export function FireworksShow({ onClose }: FireworksShowProps) {
  const [bursts, setBursts] = useState<Burst[]>([]);
  const [totalBursts, setTotalBursts] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const createBurst = useCallback((x: number, y: number) => {
    const particleCount = Math.floor(Math.random() * 20) + 30;
    const baseColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.3;
      const speed = Math.random() * 8 + 4;
      const life = Math.random() * 1000 + 1500;
      
      particles.push({
        id: i,
        x: 0,
        y: 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: Math.random() > 0.3 ? baseColor : COLORS[Math.floor(Math.random() * COLORS.length)],
        size: Math.random() * 4 + 2,
        life,
        maxLife: life,
      });
    }

    const burstId = Date.now() + Math.random();
    setBursts(prev => [...prev, { id: burstId, x, y, particles }]);
    setTotalBursts(prev => prev + 1);

    // Remove burst after animation
    setTimeout(() => {
      setBursts(prev => prev.filter(b => b.id !== burstId));
    }, 2500);
  }, []);

  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    let x: number, y: number;

    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    createBurst(x, y);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Dark background for contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-800/95 to-slate-900/90" />

      {/* Stars background */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: Math.random() * 2 + 1,
              height: Math.random() * 2 + 1,
              opacity: Math.random() * 0.7 + 0.3,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${Math.random() * 2 + 2}s`,
            }}
          />
        ))}
      </div>

      {/* Interactive area */}
      <div
        ref={containerRef}
        onClick={handleClick}
        onTouchStart={handleClick}
        className="absolute inset-0 cursor-pointer z-10"
      >
        {/* Firework bursts */}
        {bursts.map(burst => (
          <div
            key={burst.id}
            className="absolute"
            style={{ left: burst.x, top: burst.y }}
          >
            {/* Center flash */}
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full animate-ping"
              style={{
                width: 20,
                height: 20,
                backgroundColor: burst.particles[0]?.color || 'white',
                opacity: 0.8,
              }}
            />
            
            {/* Particles */}
            {burst.particles.map(particle => (
              <div
                key={particle.id}
                className="absolute rounded-full"
                style={{
                  width: particle.size,
                  height: particle.size,
                  backgroundColor: particle.color,
                  boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
                  animation: `firework-particle ${particle.maxLife}ms ease-out forwards`,
                  '--vx': `${particle.vx * 30}px`,
                  '--vy': `${particle.vy * 30}px`,
                  transform: 'translate(-50%, -50%)',
                } as React.CSSProperties}
              />
            ))}

            {/* Sparkle trails */}
            {burst.particles.slice(0, 10).map((particle, i) => (
              <div
                key={`trail-${particle.id}`}
                className="absolute"
                style={{
                  width: 2,
                  height: 2,
                  backgroundColor: particle.color,
                  animation: `firework-trail ${particle.maxLife * 0.8}ms ease-out forwards`,
                  '--vx': `${particle.vx * 15}px`,
                  '--vy': `${particle.vy * 15}px`,
                  animationDelay: `${i * 20}ms`,
                  transform: 'translate(-50%, -50%)',
                } as React.CSSProperties}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="absolute top-4 right-4 z-20">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 text-white"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Burst counter */}
      <div className="absolute top-4 left-4 z-20">
        <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          {totalBursts} Fireworks
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-8 left-0 right-0 text-center text-white/60 text-sm z-20">
        Tap anywhere to launch fireworks 🎆
      </div>

      <style>{`
        @keyframes firework-particle {
          0% {
            transform: translate(-50%, -50%) translate(0, 0);
            opacity: 1;
          }
          70% {
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) translate(var(--vx), calc(var(--vy) + 50px));
            opacity: 0;
          }
        }
        
        @keyframes firework-trail {
          0% {
            transform: translate(-50%, -50%) translate(0, 0);
            opacity: 0.8;
          }
          100% {
            transform: translate(-50%, -50%) translate(var(--vx), calc(var(--vy) + 20px));
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
