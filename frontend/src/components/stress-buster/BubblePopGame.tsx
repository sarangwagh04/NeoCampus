import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface Bubble {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  speed: number;
  opacity: number;
}

const COLORS = [
  "rgba(96, 165, 250, 0.6)",
  "rgba(167, 139, 250, 0.6)",
  "rgba(244, 114, 182, 0.6)",
  "rgba(45, 212, 191, 0.6)",
  "rgba(129, 140, 248, 0.6)",
  "rgba(34, 211, 238, 0.6)",
];

interface BubblePopGameProps {
  onClose: () => void;
}

export function BubblePopGame({ onClose }: BubblePopGameProps) {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  const createBubble = useCallback(() => {
    const newBubble: Bubble = {
      id: Date.now() + Math.random(),
      x: Math.random() * 80 + 10,
      y: -15,
      size: Math.random() * 50 + 40,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      speed: Math.random() * 0.6 + 0.4,
      opacity: Math.random() * 0.2 + 0.7,
    };
    setBubbles(prev => [...prev, newBubble]);
  }, []);

  useEffect(() => {
    const interval = setInterval(createBubble, 1000);
    return () => clearInterval(interval);
  }, [createBubble]);

  useEffect(() => {
    const moveInterval = setInterval(() => {
      setBubbles(prev => 
        prev
          .map(b => ({ ...b, y: b.y + b.speed }))
          .filter(b => b.y < 110)
      );
    }, 50);
    return () => clearInterval(moveInterval);
  }, []);

  const popBubble = (id: number) => {
    setBubbles(prev => prev.filter(b => b.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Gradient overlay fading from bottom to top */}
      <div className="absolute inset-0 bg-gradient-to-t from-sky-200/60 via-sky-100/30 to-transparent dark:from-slate-800/70 dark:via-slate-900/40 dark:to-transparent backdrop-blur-[2px]" />
      
      {/* Close button - high z-index */}
      <div className="absolute top-4 right-4 z-[60]">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white dark:hover:bg-slate-700"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>
      
      {/* Bubbles container */}
      <div className="absolute inset-0 pt-16 pointer-events-none">
        {bubbles.map(bubble => (
          <button
            key={bubble.id}
            onClick={() => popBubble(bubble.id)}
            className="absolute rounded-full transition-transform cursor-pointer hover:scale-110 pointer-events-auto"
            style={{
              left: `${bubble.x}%`,
              bottom: `${bubble.y}%`,
              width: bubble.size,
              height: bubble.size,
              background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), ${bubble.color})`,
              opacity: bubble.opacity,
              boxShadow: `0 0 20px ${bubble.color}, inset 0 0 20px rgba(255,255,255,0.3)`,
              border: '1px solid rgba(255,255,255,0.4)',
              animation: 'float 3s ease-in-out infinite',
            }}
          />
        ))}
      </div>
      
      <div className="absolute bottom-8 left-0 right-0 text-center text-foreground/60 text-sm z-[55]">
        Tap bubbles to pop them • Relax and enjoy
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(10px); }
        }
      `}</style>
    </div>
  );
}
