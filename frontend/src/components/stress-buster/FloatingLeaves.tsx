import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { X, Wind } from "lucide-react";

interface Leaf {
  id: number;
  x: number;
  y: number;
  rotation: number;
  rotationSpeed: number;
  fallSpeed: number;
  swayAmplitude: number;
  swaySpeed: number;
  size: number;
  color: string;
  type: number;
}

const LEAF_COLORS = [
  "#ff6b6b", // red
  "#ffa502", // orange
  "#ff7f50", // coral
  "#ffd700", // gold
  "#ff4757", // crimson
  "#e74c3c", // vermillion
  "#f39c12", // amber
  "#d35400", // rust
];

interface FloatingLeavesProps {
  onClose: () => void;
}

export function FloatingLeaves({ onClose }: FloatingLeavesProps) {
  const [leaves, setLeaves] = useState<Leaf[]>([]);
  const [windStrength, setWindStrength] = useState(0);

  const createLeaf = useCallback((): Leaf => {
    return {
      id: Date.now() + Math.random(),
      x: Math.random() * window.innerWidth,
      y: -50,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 4,
      fallSpeed: Math.random() * 1.5 + 0.8,
      swayAmplitude: Math.random() * 60 + 30,
      swaySpeed: Math.random() * 0.02 + 0.01,
      size: Math.random() * 25 + 20,
      color: LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)],
      type: Math.floor(Math.random() * 3),
    };
  }, []);

  // Spawn leaves periodically
  useEffect(() => {
    const spawnInterval = setInterval(() => {
      if (leaves.length < 30) {
        setLeaves(prev => [...prev, createLeaf()]);
      }
    }, 600);

    return () => clearInterval(spawnInterval);
  }, [leaves.length, createLeaf]);

  // Animate leaves
  useEffect(() => {
    let animationId: number;
    let startTime = Date.now();

    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      
      setLeaves(prev => 
        prev
          .map(leaf => ({
            ...leaf,
            y: leaf.y + leaf.fallSpeed + windStrength * 0.5,
            x: leaf.x + Math.sin(elapsed * leaf.swaySpeed * 10 + leaf.id) * leaf.swayAmplitude * 0.02 + windStrength * 2,
            rotation: leaf.rotation + leaf.rotationSpeed,
          }))
          .filter(leaf => leaf.y < window.innerHeight + 50 && leaf.x > -100 && leaf.x < window.innerWidth + 100)
      );
      
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [windStrength]);

  const handleClick = (e: React.MouseEvent) => {
    // Create wind gust effect
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const centerX = window.innerWidth / 2;
    const direction = clickX > centerX ? 1 : -1;
    
    setWindStrength(direction * 3);
    setTimeout(() => setWindStrength(0), 500);
    
    // Spawn extra leaves
    const newLeaves: Leaf[] = [];
    for (let i = 0; i < 5; i++) {
      newLeaves.push({
        ...createLeaf(),
        x: e.clientX + (Math.random() - 0.5) * 100,
        y: e.clientY + (Math.random() - 0.5) * 50,
      });
    }
    setLeaves(prev => [...prev, ...newLeaves]);
  };

  const getLeafPath = (type: number) => {
    switch (type) {
      case 0: // Maple leaf shape
        return "M12 2 L14 8 L20 6 L16 12 L22 14 L16 16 L18 22 L12 18 L6 22 L8 16 L2 14 L8 12 L4 6 L10 8 Z";
      case 1: // Oak leaf shape
        return "M12 2 C14 4 16 3 18 6 C16 8 18 10 16 12 C18 14 16 16 18 18 C16 20 14 22 12 22 C10 22 8 20 6 18 C8 16 6 14 8 12 C6 10 8 8 6 6 C8 3 10 4 12 2";
      case 2: // Simple oval leaf
        return "M12 2 Q20 10 12 22 Q4 10 12 2";
      default:
        return "M12 2 L14 8 L20 6 L16 12 L22 14 L16 16 L18 22 L12 18 L6 22 L8 16 L2 14 L8 12 L4 6 L10 8 Z";
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Gradient overlay - autumn sky */}
      <div className="absolute inset-0 bg-gradient-to-t from-amber-200/60 via-orange-100/30 to-transparent dark:from-slate-800/70 dark:via-slate-900/40 dark:to-transparent backdrop-blur-[2px]" />
      
      {/* Interactive area */}
      <div
        className="absolute inset-0 cursor-pointer z-[52]"
        onClick={handleClick}
      >
        {/* Falling leaves */}
        {leaves.map(leaf => (
          <svg
            key={leaf.id}
            className="absolute pointer-events-none transition-transform"
            style={{
              left: leaf.x - leaf.size / 2,
              top: leaf.y - leaf.size / 2,
              width: leaf.size,
              height: leaf.size,
              transform: `rotate(${leaf.rotation}deg)`,
            }}
            viewBox="0 0 24 24"
          >
            <defs>
              <linearGradient id={`leafGrad-${leaf.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={leaf.color} />
                <stop offset="100%" stopColor={leaf.color} stopOpacity="0.7" />
              </linearGradient>
            </defs>
            <path
              d={getLeafPath(leaf.type)}
              fill={`url(#leafGrad-${leaf.id})`}
              stroke={leaf.color}
              strokeWidth="0.5"
            />
            {/* Leaf vein */}
            <path
              d="M12 4 L12 20"
              stroke={leaf.color}
              strokeWidth="0.5"
              strokeOpacity="0.5"
              fill="none"
            />
          </svg>
        ))}
      </div>

      {/* Controls */}
      <div className="absolute top-4 right-4 flex gap-2 z-[60]">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setWindStrength(5);
            setTimeout(() => setWindStrength(0), 1000);
          }}
          className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white dark:hover:bg-slate-700"
        >
          <Wind className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white dark:hover:bg-slate-700"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Leaf counter */}
      <div className="absolute top-4 left-4 z-[60]">
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium">
          🍂 Leaves: {leaves.length}
        </div>
      </div>

      <div className="absolute bottom-8 left-0 right-0 text-center text-foreground/60 text-sm z-[55]">
        Click anywhere to create wind • Watch the leaves dance
      </div>
    </div>
  );
}
