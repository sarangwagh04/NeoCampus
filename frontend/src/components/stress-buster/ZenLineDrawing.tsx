import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { X, Trash2 } from "lucide-react";

interface Point {
  x: number;
  y: number;
}

interface Line {
  id: number;
  points: Point[];
  color: string;
  opacity: number;
}

const COLORS = [
  "rgba(96, 165, 250, 0.8)",
  "rgba(167, 139, 250, 0.8)",
  "rgba(244, 114, 182, 0.8)",
  "rgba(45, 212, 191, 0.8)",
  "rgba(251, 191, 36, 0.8)",
  "rgba(129, 140, 248, 0.8)",
];

interface ZenLineDrawingProps {
  onClose: () => void;
}

export function ZenLineDrawing({ onClose }: ZenLineDrawingProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState(COLORS[0]);
  const currentLineIdRef = useRef<number | null>(null);

  const getRandomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent | TouchEvent | MouseEvent): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in e && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    
    if ('clientX' in e) {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }

    return null;
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const point = getCoordinates(e);
    if (!point) return;
    
    const newColor = getRandomColor();
    setCurrentColor(newColor);
    setIsDrawing(true);
    
    const newLineId = Date.now();
    currentLineIdRef.current = newLineId;
    
    const newLine: Line = {
      id: newLineId,
      points: [point],
      color: newColor,
      opacity: 1,
    };
    
    setLines(prev => [...prev, newLine]);
  };

  const draw = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDrawing || currentLineIdRef.current === null) return;
    
    e.preventDefault();
    const point = getCoordinates(e);
    if (!point) return;
    
    setLines(prev => prev.map(line => {
      if (line.id === currentLineIdRef.current) {
        return {
          ...line,
          points: [...line.points, point],
        };
      }
      return line;
    }));
  }, [isDrawing]);

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
    currentLineIdRef.current = null;
  }, []);

  // Add global event listeners for smooth drawing
  useEffect(() => {
    if (isDrawing) {
      window.addEventListener('mousemove', draw);
      window.addEventListener('mouseup', stopDrawing);
      window.addEventListener('touchmove', draw, { passive: false });
      window.addEventListener('touchend', stopDrawing);
      
      return () => {
        window.removeEventListener('mousemove', draw);
        window.removeEventListener('mouseup', stopDrawing);
        window.removeEventListener('touchmove', draw);
        window.removeEventListener('touchend', stopDrawing);
      };
    }
  }, [isDrawing, draw, stopDrawing]);

  // Fade out lines over time
  useEffect(() => {
    const fadeInterval = setInterval(() => {
      setLines(prev => 
        prev
          .map(line => ({
            ...line,
            opacity: Math.max(0, line.opacity - 0.012),
          }))
          .filter(line => line.opacity > 0)
      );
    }, 100);

    return () => clearInterval(fadeInterval);
  }, []);

  // Redraw canvas when lines change
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    lines.forEach(line => {
      if (line.points.length < 2) return;
      
      ctx.beginPath();
      ctx.moveTo(line.points[0].x, line.points[0].y);
      
      // Use quadratic curves for smoother lines
      for (let i = 1; i < line.points.length - 1; i++) {
        const xc = (line.points[i].x + line.points[i + 1].x) / 2;
        const yc = (line.points[i].y + line.points[i + 1].y) / 2;
        ctx.quadraticCurveTo(line.points[i].x, line.points[i].y, xc, yc);
      }
      
      // Draw to the last point
      if (line.points.length > 1) {
        const lastPoint = line.points[line.points.length - 1];
        ctx.lineTo(lastPoint.x, lastPoint.y);
      }
      
      ctx.strokeStyle = line.color.replace(/[\d.]+\)$/, `${line.opacity})`);
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    });
  }, [lines]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // Handle canvas resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      redrawCanvas();
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [redrawCanvas]);

  const clearCanvas = () => {
    setLines([]);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-indigo-200/60 via-purple-100/30 to-transparent dark:from-slate-800/70 dark:via-slate-900/40 dark:to-transparent backdrop-blur-[2px]" />
      
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 cursor-crosshair z-[52] touch-none"
        onMouseDown={startDrawing}
        onTouchStart={startDrawing}
      />

      {/* Controls */}
      <div className="absolute top-4 right-4 flex gap-2 z-[60]">
        <Button
          variant="ghost"
          size="icon"
          onClick={clearCanvas}
          className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white dark:hover:bg-slate-700"
        >
          <Trash2 className="w-5 h-5" />
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

      <div className="absolute bottom-8 left-0 right-0 text-center text-foreground/60 text-sm z-[55]">
        Draw freely • Lines fade away • Pure relaxation
      </div>
    </div>
  );
}
