import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GameCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  onPlay: () => void;
}

export function GameCard({ title, description, icon: Icon, color, onPlay }: GameCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50">
      <CardContent className="p-6 flex flex-col items-center text-center gap-4">
        <div className={cn(
          "w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
          color
        )}>
          <Icon className="w-8 h-8 text-white" />
        </div>
        <div className="space-y-1">
          <h3 className="font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Button 
          onClick={onPlay}
          className="w-full mt-2"
          variant="outline"
        >
          Play Now
        </Button>
      </CardContent>
    </Card>
  );
}
