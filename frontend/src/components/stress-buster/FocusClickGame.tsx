import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X, RotateCcw } from "lucide-react";

const COLORS = [
  { name: "Red", bg: "bg-red-500", value: "#ef4444" },
  { name: "Blue", bg: "bg-blue-500", value: "#3b82f6" },
  { name: "Green", bg: "bg-green-500", value: "#22c55e" },
  { name: "Yellow", bg: "bg-yellow-500", value: "#eab308" },
  { name: "Purple", bg: "bg-purple-500", value: "#a855f7" },
  { name: "Orange", bg: "bg-orange-500", value: "#f97316" },
];

type GameState = "waiting" | "ready" | "clicked" | "too-early";

interface FocusClickGameProps {
  onClose: () => void;
}

export function FocusClickGame({ onClose }: FocusClickGameProps) {
  const [gameState, setGameState] = useState<GameState>("waiting");
  const [currentColor, setCurrentColor] = useState(COLORS[0]);
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const colorChangeTimeRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getRandomColor = useCallback((excludeColor?: typeof COLORS[0]) => {
    const available = COLORS.filter(c => c.value !== excludeColor?.value);
    return available[Math.floor(Math.random() * available.length)];
  }, []);

  const startRound = useCallback(() => {
    setGameState("waiting");
    setReactionTime(null);
    
    // Random delay between 2-5 seconds before color changes
    const delay = Math.random() * 3000 + 2000;
    
    timeoutRef.current = setTimeout(() => {
      const newColor = getRandomColor(currentColor);
      setCurrentColor(newColor);
      colorChangeTimeRef.current = Date.now();
      setGameState("ready");
    }, delay);
  }, [currentColor, getRandomColor]);

  useEffect(() => {
    startRound();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleClick = () => {
    if (gameState === "waiting") {
      // Clicked too early
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setGameState("too-early");
    } else if (gameState === "ready") {
      // Calculate reaction time
      const time = Date.now() - colorChangeTimeRef.current;
      setReactionTime(time);
      setGameState("clicked");
      
      if (bestTime === null || time < bestTime) {
        setBestTime(time);
      }
    }
  };

  const handleNextRound = () => {
    startRound();
  };

  const resetGame = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setBestTime(null);
    setReactionTime(null);
    startRound();
  };

  const getBackgroundClass = () => {
    if (gameState === "too-early") return "bg-red-900/60";
    if (gameState === "ready" || gameState === "clicked") return currentColor.bg + "/70";
    return "bg-slate-700/60";
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center">
      {/* Gradient overlay fading from bottom to top */}
      <div className="absolute inset-0 bg-gradient-to-t from-amber-200/60 via-orange-100/30 to-transparent dark:from-slate-800/70 dark:via-slate-900/40 dark:to-transparent backdrop-blur-[2px]" />
      {/* Dynamic color overlay */}
      <div 
        className={`absolute inset-0 transition-colors duration-100 ${getBackgroundClass()}`} 
      />
      
      {/* Controls */}
      <div className="absolute top-4 right-4 flex gap-2 z-[60]">
        <Button
          variant="ghost"
          size="icon"
          onClick={resetGame}
          className="bg-white/20 backdrop-blur-sm rounded-full text-white hover:text-white hover:bg-white/30"
        >
          <RotateCcw className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="bg-white/20 backdrop-blur-sm rounded-full text-white hover:text-white hover:bg-white/30"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Best time display */}
      {bestTime !== null && (
        <div className="absolute top-4 left-4 z-[60]">
          <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium text-white">
            Best: {bestTime}ms
          </div>
        </div>
      )}

      {/* Main game area */}
      <div 
        className="relative z-[55] flex flex-col items-center justify-center cursor-pointer w-full h-full"
        onClick={handleClick}
      >
        {gameState === "waiting" && (
          <div className="text-center">
            <div className="w-32 h-32 rounded-full bg-slate-600/80 backdrop-blur-sm mx-auto mb-6 flex items-center justify-center">
              <span className="text-white/80 text-lg">Wait...</span>
            </div>
            <p className="text-white/70 text-lg">Wait for the color to change</p>
          </div>
        )}

        {gameState === "ready" && (
          <div className="text-center">
            <div 
              className={`w-40 h-40 rounded-full ${currentColor.bg} mx-auto mb-6 flex items-center justify-center shadow-2xl animate-scale-in`}
            >
              <span className="text-white text-2xl font-bold">CLICK!</span>
            </div>
            <p className="text-white text-xl font-medium">Click now!</p>
          </div>
        )}

        {gameState === "clicked" && reactionTime !== null && (
          <div className="text-center">
            <div className="w-40 h-40 rounded-full bg-white/20 backdrop-blur-sm mx-auto mb-6 flex items-center justify-center">
              <div className="text-center">
                <span className="text-white text-4xl font-bold block">{reactionTime}</span>
                <span className="text-white/70 text-lg">ms</span>
              </div>
            </div>
            <p className="text-white/90 text-lg mb-4">
              {reactionTime < 200 ? "🔥 Incredible!" : 
               reactionTime < 300 ? "⚡ Great!" : 
               reactionTime < 400 ? "👍 Good" : "Keep practicing!"}
            </p>
            <Button 
              onClick={(e) => { e.stopPropagation(); handleNextRound(); }}
              className="bg-white/20 hover:bg-white/30 text-white"
            >
              Try Again
            </Button>
          </div>
        )}

        {gameState === "too-early" && (
          <div className="text-center">
            <div className="w-40 h-40 rounded-full bg-red-500/80 mx-auto mb-6 flex items-center justify-center">
              <span className="text-white text-xl font-bold">Too Early!</span>
            </div>
            <p className="text-white/90 text-lg mb-4">Wait for the color to change</p>
            <Button 
              onClick={(e) => { e.stopPropagation(); handleNextRound(); }}
              className="bg-white/20 hover:bg-white/30 text-white"
            >
              Try Again
            </Button>
          </div>
        )}
      </div>

      <div className="absolute bottom-8 left-0 right-0 text-center text-white/50 text-sm z-[55] pointer-events-none">
        Click when the color changes • Test your reflexes
      </div>
    </div>
  );
}
