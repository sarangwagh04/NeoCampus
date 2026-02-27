import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { X, RotateCcw } from "lucide-react";

interface Tile {
  id: number;
  color: string;
  matched: boolean;
  flipped: boolean;
}

const COLORS = [
  "bg-red-400",
  "bg-blue-400",
  "bg-green-400",
  "bg-yellow-400",
  "bg-purple-400",
  "bg-pink-400",
];

interface ColorMatchGameProps {
  onClose: () => void;
}

export function ColorMatchGame({ onClose }: ColorMatchGameProps) {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  const initGame = useCallback(() => {
    const colorPairs = [...COLORS, ...COLORS];
    const shuffled = colorPairs
      .sort(() => Math.random() - 0.5)
      .map((color, index) => ({
        id: index,
        color,
        matched: false,
        flipped: false,
      }));
    setTiles(shuffled);
    setFlippedIds([]);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const handleTileClick = (id: number) => {
    if (isChecking) return;
    
    const tile = tiles.find(t => t.id === id);
    if (!tile || tile.matched || tile.flipped) return;

    const newFlipped = [...flippedIds, id];
    setFlippedIds(newFlipped);
    setTiles(prev => prev.map(t => 
      t.id === id ? { ...t, flipped: true } : t
    ));

    if (newFlipped.length === 2) {
      setIsChecking(true);
      
      const [first, second] = newFlipped;
      const firstTile = tiles.find(t => t.id === first);
      const secondTile = tiles.find(t => t.id === second);

      setTimeout(() => {
        if (firstTile?.color === secondTile?.color) {
          setTiles(prev => prev.map(t => 
            t.id === first || t.id === second 
              ? { ...t, matched: true } 
              : t
          ));
        } else {
          setTiles(prev => prev.map(t => 
            t.id === first || t.id === second 
              ? { ...t, flipped: false } 
              : t
          ));
        }
        setFlippedIds([]);
        setIsChecking(false);
      }, 800);
    }
  };

  const allMatched = tiles.length > 0 && tiles.every(t => t.matched);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center">
      {/* Gradient overlay fading from bottom to top */}
      <div className="absolute inset-0 bg-gradient-to-t from-violet-200/60 via-purple-100/30 to-transparent dark:from-slate-800/70 dark:via-slate-900/40 dark:to-transparent backdrop-blur-[2px]" />
      
      {/* Controls */}
      <div className="absolute top-4 right-4 flex gap-2 z-[60]">
        <Button
          variant="ghost"
          size="icon"
          onClick={initGame}
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

      {/* Game grid */}
      <div className="grid grid-cols-4 gap-4 max-w-lg relative z-[55]">
        {tiles.map(tile => (
          <button
            key={tile.id}
            onClick={() => handleTileClick(tile.id)}
            disabled={tile.matched || tile.flipped}
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-xl transition-all duration-300 transform
              ${tile.flipped || tile.matched 
                ? tile.color 
                : 'bg-white/80 dark:bg-slate-700/80 shadow-lg hover:shadow-xl hover:scale-105 backdrop-blur-sm'
              }
              ${tile.matched ? 'opacity-50 scale-95' : ''}
            `}
          />
        ))}
      </div>

      {allMatched && (
        <div className="mt-8 text-center animate-fade-in relative z-[55]">
          <p className="text-xl font-semibold text-foreground mb-2">🎉 Great job!</p>
          <Button onClick={initGame}>Play Again</Button>
        </div>
      )}

      <div className="absolute bottom-8 left-0 right-0 text-center text-foreground/60 text-sm z-[55]">
        Match the colors • Take your time
      </div>
    </div>
  );
}
