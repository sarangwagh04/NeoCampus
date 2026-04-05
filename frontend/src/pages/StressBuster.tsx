import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { GameCard } from "@/components/stress-buster/GameCard";
import { BubblePopGame } from "@/components/stress-buster/BubblePopGame";
import { ColorMatchGame } from "@/components/stress-buster/ColorMatchGame";
import { BreathingGuide } from "@/components/stress-buster/BreathingGuide";
import { FocusClickGame } from "@/components/stress-buster/FocusClickGame";
import { ZenLineDrawing } from "@/components/stress-buster/ZenLineDrawing";
import { MemoryPatternGlow } from "@/components/stress-buster/MemoryPatternGlow";
import { FireworksShow } from "@/components/stress-buster/FireworksShow";
import { FloatingLeaves } from "@/components/stress-buster/FloatingLeaves";
import { Sparkles, Circle, Palette, Wind, Target, Pencil, Lightbulb, Leaf, PartyPopper } from "lucide-react";

type GameType = "bubble" | "color" | "breathing" | "focus" | "zen" | "memory" | "fireworks" | "leaves" | null;

const games = [
  {
    id: "bubble" as const,
    title: "Bubble Pop",
    description: "Pop floating bubbles to relax your mind",
    icon: Circle,
    color: "bg-gradient-to-br from-blue-400 to-cyan-500",
  },
  {
    id: "color" as const,
    title: "Color Match",
    description: "Match pairs of colors at your own pace",
    icon: Palette,
    color: "bg-gradient-to-br from-purple-400 to-pink-500",
  },
  {
    id: "breathing" as const,
    title: "Breathing Guide",
    description: "Follow the circle for calm breathing",
    icon: Wind,
    color: "bg-gradient-to-br from-teal-400 to-emerald-500",
  },
  {
    id: "focus" as const,
    title: "Focus Click",
    description: "Click appearing shapes to improve focus",
    icon: Target,
    color: "bg-gradient-to-br from-amber-400 to-orange-500",
  },
  {
    id: "zen" as const,
    title: "Zen Line Drawing",
    description: "Draw lines freely, watch them fade away",
    icon: Pencil,
    color: "bg-gradient-to-br from-indigo-400 to-violet-500",
  },
  {
    id: "memory" as const,
    title: "Memory Pattern",
    description: "Repeat glowing patterns at your pace",
    icon: Lightbulb,
    color: "bg-gradient-to-br from-yellow-400 to-amber-500",
  },
  {
    id: "fireworks" as const,
    title: "Fireworks Show",
    description: "Tap to launch colorful fireworks in the night sky",
    icon: PartyPopper,
    color: "bg-gradient-to-br from-violet-500 to-pink-500",
  },
  {
    id: "leaves" as const,
    title: "Floating Leaves",
    description: "Watch autumn leaves fall and dance in the wind",
    icon: Leaf,
    color: "bg-gradient-to-br from-orange-400 to-amber-500",
  },
];

export default function StressBuster() {
  const [activeGame, setActiveGame] = useState<GameType>(null);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Stress Buster</h1>
            <p className="text-muted-foreground">
              Take a short break. Relax your mind.
            </p>
          </div>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {games.map((game) => (
            <GameCard
              key={game.id}
              title={game.title}
              description={game.description}
              icon={game.icon}
              color={game.color}
              onPlay={() => setActiveGame(game.id)}
            />
          ))}
        </div>

        {/* Info Section */}
        <div className="bg-muted/30 rounded-xl p-6 text-center">
          <p className="text-muted-foreground text-sm">
            🧘 These games are designed to help you relax between study sessions.
            <br />
            No scores are saved • No pressure • Just take a break.
          </p>
        </div>
      </div>

      {/* Game Modals */}
      {activeGame === "bubble" && <BubblePopGame onClose={() => setActiveGame(null)} />}
      {activeGame === "color" && <ColorMatchGame onClose={() => setActiveGame(null)} />}
      {activeGame === "breathing" && <BreathingGuide onClose={() => setActiveGame(null)} />}
      {activeGame === "focus" && <FocusClickGame onClose={() => setActiveGame(null)} />}
      {activeGame === "zen" && <ZenLineDrawing onClose={() => setActiveGame(null)} />}
      {activeGame === "memory" && <MemoryPatternGlow onClose={() => setActiveGame(null)} />}
      {activeGame === "fireworks" && <FireworksShow onClose={() => setActiveGame(null)} />}
      {activeGame === "leaves" && <FloatingLeaves onClose={() => setActiveGame(null)} />}
    </DashboardLayout>
  );
}
