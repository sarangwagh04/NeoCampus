import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { X, RotateCcw } from "lucide-react";

interface MemoryPatternGlowProps {
  onClose: () => void;
}

const GRID_SIZE = 9;

export function MemoryPatternGlow({ onClose }: MemoryPatternGlowProps) {
  const [pattern, setPattern] = useState<number[]>([]);
  const [userPattern, setUserPattern] = useState<number[]>([]);
  const [isShowingPattern, setIsShowingPattern] = useState(false);
  const [glowingTile, setGlowingTile] = useState<number | null>(null);
  const [level, setLevel] = useState(1);
  const [gameState, setGameState] = useState<"watching" | "playing" | "success" | "fail">("watching");

  const generatePattern = useCallback((length: number) => {
    const newPattern: number[] = [];
    for (let i = 0; i < length; i++) {
      newPattern.push(Math.floor(Math.random() * GRID_SIZE));
    }
    return newPattern;
  }, []);

  const showPattern = useCallback(async (patternToShow: number[]) => {
    setIsShowingPattern(true);
    setGameState("watching");
    
    for (let i = 0; i < patternToShow.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 600));
      setGlowingTile(patternToShow[i]);
      await new Promise(resolve => setTimeout(resolve, 500));
      setGlowingTile(null);
    }
    
    await new Promise(resolve => setTimeout(resolve, 300));
    setIsShowingPattern(false);
    setGameState("playing");
  }, []);

  const startNewRound = useCallback(() => {
    const newPattern = generatePattern(level + 2);
    setPattern(newPattern);
    setUserPattern([]);
    showPattern(newPattern);
  }, [level, generatePattern, showPattern]);

  useEffect(() => {
    startNewRound();
  }, []);

  const handleTileClick = (index: number) => {
    if (isShowingPattern || gameState !== "playing") return;

    // Flash the tile
    setGlowingTile(index);
    setTimeout(() => setGlowingTile(null), 200);

    const newUserPattern = [...userPattern, index];
    setUserPattern(newUserPattern);

    // Check if correct so far
    const currentIndex = newUserPattern.length - 1;
    if (pattern[currentIndex] !== index) {
      setGameState("fail");
      return;
    }

    // Check if completed
    if (newUserPattern.length === pattern.length) {
      setGameState("success");
    }
  };

  const handleNextLevel = () => {
    setLevel(prev => prev + 1);
    setUserPattern([]);
    const newPattern = generatePattern(level + 3);
    setPattern(newPattern);
    showPattern(newPattern);
  };

  const handleRestart = () => {
    setLevel(1);
    setUserPattern([]);
    const newPattern = generatePattern(3);
    setPattern(newPattern);
    showPattern(newPattern);
  };

  const getProgressDots = () => {
    return pattern.map((_, index) => (
      <div
        key={index}
        className={`w-2 h-2 rounded-full transition-all ${
          index < userPattern.length
            ? userPattern[index] === pattern[index]
              ? 'bg-green-400'
              : 'bg-red-400'
            : 'bg-white/30'
        }`}
      />
    ));
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center">
      {/* Gradient overlay fading from bottom to top */}
      <div className="absolute inset-0 bg-gradient-to-t from-violet-200/60 via-purple-100/30 to-transparent dark:from-slate-800/70 dark:via-slate-900/40 dark:to-transparent backdrop-blur-[2px]" />

      {/* Controls */}
      <div className="absolute top-4 right-4 flex gap-2 z-[60]">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRestart}
          className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white dark:hover:bg-slate-700"
        >
          <RotateCcw className="w-5 h-5" />
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

      {/* Level indicator */}
      <div className="absolute top-4 left-4 z-[60]">
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium">
          Level {level}
        </div>
      </div>

      {/* Status message */}
      <div className="mb-6 z-[55]">
        {gameState === "watching" && (
          <p className="text-lg font-medium text-foreground/80">Watch the pattern...</p>
        )}
        {gameState === "playing" && (
          <p className="text-lg font-medium text-foreground/80">Your turn! Repeat the pattern</p>
        )}
        {gameState === "success" && (
          <p className="text-lg font-medium text-green-600 dark:text-green-400">🎉 Perfect!</p>
        )}
        {gameState === "fail" && (
          <p className="text-lg font-medium text-red-500">Try again!</p>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-3 relative z-[55]">
        {Array.from({ length: GRID_SIZE }).map((_, index) => (
          <button
            key={index}
            onClick={() => handleTileClick(index)}
            disabled={isShowingPattern || gameState === "success" || gameState === "fail"}
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-xl transition-all duration-300 
              ${glowingTile === index 
                ? 'bg-gradient-to-br from-amber-300 to-yellow-500 scale-105 shadow-[0_0_30px_rgba(251,191,36,0.6)]' 
                : 'bg-white/80 dark:bg-slate-700/80 shadow-lg hover:shadow-xl hover:scale-102 backdrop-blur-sm'
              }
              ${!isShowingPattern && gameState === "playing" ? 'cursor-pointer hover:bg-white/90 dark:hover:bg-slate-600/90' : 'cursor-default'}
            `}
          />
        ))}
      </div>

      {/* Progress dots */}
      <div className="mt-6 flex gap-2 z-[55]">
        {getProgressDots()}
      </div>

      {/* Action buttons */}
      {(gameState === "success" || gameState === "fail") && (
        <div className="mt-6 flex gap-3 z-[55]">
          {gameState === "success" && (
            <Button onClick={handleNextLevel} className="animate-fade-in">
              Next Level →
            </Button>
          )}
          <Button onClick={handleRestart} variant="outline" className="animate-fade-in">
            Start Over
          </Button>
        </div>
      )}

      <div className="absolute bottom-8 left-0 right-0 text-center text-foreground/60 text-sm z-[55]">
        Watch the glow • Repeat the pattern • No time pressure
      </div>
    </div>
  );
}
