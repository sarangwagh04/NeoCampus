import { useState, useEffect } from "react";
import {
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  GraduationCap,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StaffStat, TodayClass } from "@/hooks/useStaffData";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  GraduationCap,
};

const statusColors = {
  success: {
    bg: "bg-success/10",
    text: "text-success",
    border: "border-success/20",
  },
  warning: {
    bg: "bg-warning/10",
    text: "text-warning",
    border: "border-warning/20",
  },
  danger: {
    bg: "bg-destructive/10",
    text: "text-destructive",
    border: "border-destructive/20",
  },
};

interface StaffStatCardsProps {
  stats: StaffStat[] | null;
  isLoading: boolean;
  todayClasses?: TodayClass[] | null;
}

function useCountdown(todayClasses: TodayClass[] | null | undefined) {
  const [countdown, setCountdown] = useState<string>("--:--");
  const [nextClass, setNextClass] = useState<TodayClass | null>(null);

  useEffect(() => {
    if (!todayClasses || todayClasses.length === 0) {
      setCountdown("No classes");
      return;
    }

    const calculateCountdown = () => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      // Find next upcoming class
      const upcoming = todayClasses.find((c) => {
        const [startTime] = c.time.split(" - ");
        const [startH, startM] = startTime.split(":").map(Number);
        const startMinutes = startH * 60 + startM;
        return currentMinutes < startMinutes;
      });

      if (!upcoming) {
        setCountdown("Done for today");
        setNextClass(null);
        return;
      }

      setNextClass(upcoming);

      const [startTime] = upcoming.time.split(" - ");
      const [startH, startM] = startTime.split(":").map(Number);
      const startMinutes = startH * 60 + startM;
      const diffMinutes = startMinutes - currentMinutes;

      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;

      if (hours > 0) {
        setCountdown(`${hours}h ${minutes}m`);
      } else {
        setCountdown(`${minutes}m`);
      }
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [todayClasses]);

  return { countdown, nextClass };
}

export function StaffStatCards({ stats, isLoading, todayClasses }: StaffStatCardsProps) {
  const { countdown, nextClass } = useCountdown(todayClasses);
  
  // Limit to 4 stat cards
  const displayStats = stats?.slice(0, 4) ?? [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-4">
              <Skeleton className="h-10 w-10 rounded-lg mb-3" />
              <Skeleton className="h-7 w-16 mb-1" />
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {displayStats.map((stat, index) => {
        const Icon = iconMap[stat.icon] || BookOpen;
        const colors = statusColors[stat.status];
        const isCountdownCard = stat.value === "countdown";

        const cardContent = (
          <CardContent className="p-4">
            <div
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center mb-3",
                colors.bg
              )}
            >
              <Icon className={cn("w-5 h-5", colors.text)} />
            </div>
            <div className="text-2xl font-bold text-foreground">
              {isCountdownCard ? countdown : stat.value}
            </div>
            <div className="text-sm text-muted-foreground">
              {isCountdownCard && nextClass 
                ? nextClass.subject.split(" ").slice(0, 2).join(" ")
                : stat.label}
            </div>
          </CardContent>
        );

        if (stat.href && stat.href !== "#") {
          return (
            <Link key={stat.label} to={stat.href}>
              <Card
                className={cn(
                  "overflow-hidden card-shadow hover:shadow-lg transition-all duration-300 animate-scale-in border cursor-pointer",
                  colors.border
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {cardContent}
              </Card>
            </Link>
          );
        }

        return (
          <Card
            key={stat.label}
            className={cn(
              "overflow-hidden card-shadow hover:shadow-lg transition-all duration-300 animate-scale-in border",
              colors.border
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {cardContent}
          </Card>
        );
      })}
    </div>
  );
}
