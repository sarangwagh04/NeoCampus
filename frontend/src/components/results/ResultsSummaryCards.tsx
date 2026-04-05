import { Award, AlertTriangle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProgressRing } from "@/components/dashboard/ProgressRing";

interface OverallStats {
  currentSgpa: number;
  totalBacklogs: number;
  creditsEarned: number;
  totalCredits: number;
  overallStatus: string;
  latestSemester: number;
}

interface ResultsSummaryCardsProps {
  stats: OverallStats;
}

export function ResultsSummaryCards({ stats }: ResultsSummaryCardsProps) {
  const creditPercentage =
  stats.totalCredits > 0
    ? Math.round((stats.creditsEarned / stats.totalCredits) * 100)
    : 0;
  const hasBacklogs = stats.totalBacklogs > 0;

  const cards = [
    {
      label: "Current Semester",
      value: `Semester ${stats.latestSemester}`,
      subtitle: hasBacklogs ? "Has Backlogs" : "Passed",
      icon: hasBacklogs ? AlertTriangle : CheckCircle,
      color: hasBacklogs ? "text-warning" : "text-success",
      bgColor: hasBacklogs ? "bg-warning/10" : "bg-success/10",
    },
    {
      label: "Current SGPA",
      value: stats.currentSgpa.toFixed(2),
      subtitle: `Semester ${stats.latestSemester}`,
      icon: Award,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Active Backlogs",
      value: stats.totalBacklogs.toString(),
      subtitle: stats.totalBacklogs === 0 ? "All clear!" : "Requires attention",
      icon: AlertTriangle,
      color: stats.totalBacklogs > 0 ? "text-destructive" : "text-success",
      bgColor: stats.totalBacklogs > 0 ? "bg-destructive/10" : "bg-success/10",
    },
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <div
          key={card.label}
          className="stat-card animate-slide-up"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="flex flex-col">
            <div className="flex items-center justify-between">
              <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", card.bgColor)}>
                <card.icon className={cn("w-5 h-5", card.color)} />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-foreground">{card.value}</p>
            <p className="text-sm text-muted-foreground">{card.label}</p>
            <p className="text-xs text-muted-foreground/70 mt-0.5">{card.subtitle}</p>
          </div>
        </div>
      ))}

      {/* Credits Progress Card */}
      <div
        className="stat-card animate-slide-up"
        style={{ animationDelay: `0.4s` }}
      >
        <div className="flex flex-col items-center">
          <ProgressRing value={creditPercentage} size={80} />
          <p className="mt-3 text-sm font-medium text-muted-foreground text-center">
            Credits Earned
          </p>
          <p className="text-xs text-muted-foreground/70">
            {stats.creditsEarned} / {stats.totalCredits}
          </p>
        </div>
      </div>
    </div>
  );
}
