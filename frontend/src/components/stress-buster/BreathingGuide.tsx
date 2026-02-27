import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Volume2, VolumeX } from "lucide-react";

interface BreathingGuideProps {
  onClose: () => void;
}

type Phase = "inhale" | "hold" | "exhale" | "rest";

const PHASES: { phase: Phase; duration: number; label: string }[] = [
  { phase: "inhale", duration: 4000, label: "Breathe In" },
  { phase: "hold", duration: 4000, label: "Hold" },
  { phase: "exhale", duration: 4000, label: "Breathe Out" },
  { phase: "rest", duration: 2000, label: "Rest" },
];

export function BreathingGuide({ onClose }: BreathingGuideProps) {
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const currentPhase = PHASES[currentPhaseIndex];

  useEffect(() => {
    if (isPaused) return;

    const timer = setTimeout(() => {
      if (currentPhaseIndex === PHASES.length - 1) {
        setCurrentPhaseIndex(0);
      } else {
        setCurrentPhaseIndex(i => i + 1);
      }
    }, currentPhase.duration);

    return () => clearTimeout(timer);
  }, [currentPhaseIndex, currentPhase.duration, isPaused]);

  const getCircleScale = () => {
    switch (currentPhase.phase) {
      case "inhale":
        return 1;
      case "hold":
        return 1;
      case "exhale":
        return 0.6;
      case "rest":
        return 0.6;
      default:
        return 0.6;
    }
  };

  const getCircleColor = () => {
    switch (currentPhase.phase) {
      case "inhale":
        return "from-teal-400/80 to-cyan-500/80";
      case "hold":
        return "from-blue-400/80 to-indigo-500/80";
      case "exhale":
        return "from-purple-400/80 to-pink-500/80";
      case "rest":
        return "from-gray-400/80 to-slate-500/80";
      default:
        return "from-teal-400/80 to-cyan-500/80";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center">
      {/* Gradient overlay fading from bottom to top */}
      <div className="absolute inset-0 bg-gradient-to-t from-teal-200/60 via-emerald-100/30 to-transparent dark:from-slate-800/70 dark:via-slate-900/40 dark:to-transparent backdrop-blur-[2px]" />
      
      {/* Controls */}
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

      {/* Breathing circle */}
      <div className="relative flex items-center justify-center z-[55]">
        {/* Outer glow */}
        <div 
          className={`absolute w-64 h-64 rounded-full bg-gradient-to-r ${getCircleColor()} opacity-30 blur-3xl`}
          style={{
            transform: `scale(${getCircleScale()})`,
            transition: `transform ${currentPhase.duration}ms ease-in-out`,
          }}
        />
        
        {/* Main circle */}
        <div 
          className={`w-48 h-48 rounded-full bg-gradient-to-r ${getCircleColor()} shadow-2xl flex items-center justify-center backdrop-blur-sm`}
          style={{
            transform: `scale(${getCircleScale()})`,
            transition: `transform ${currentPhase.duration}ms ease-in-out`,
          }}
        >
          <span className="text-white text-xl font-medium">{currentPhase.label}</span>
        </div>
      </div>

      {/* Phase indicators */}
      <div className="mt-12 flex gap-2 z-[55]">
        {PHASES.map((p, i) => (
          <div
            key={p.phase}
            className={`w-2 h-2 rounded-full transition-all ${
              i === currentPhaseIndex 
                ? 'bg-white scale-125' 
                : 'bg-white/30'
            }`}
          />
        ))}
      </div>

      <div className="absolute bottom-8 left-0 right-0 text-center text-white/50 text-sm z-[55]">
        Follow the circle • Breathe naturally
      </div>
    </div>
  );
}
