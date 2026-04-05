import {
  CalendarCheck,
  BookOpen,
  TrendingUp,
  Trophy
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ProgressRing } from "@/components/dashboard/ProgressRing";
import { cn } from "@/lib/utils";



interface StatsProps {
  stats?: {
    attendance_percentage: number;
    subjects_enrolled: number;
    current_sgpa: number;
    rank: number;
  };
  loading: boolean;
}

export function StatCards({ stats, loading }: StatsProps) {
  const navigate = useNavigate();
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card animate-pulse h-32" />
        <div className="stat-card animate-pulse h-32" />
        <div className="stat-card animate-pulse h-32" />
        <div className="stat-card animate-pulse h-32" />
      </div>
    );
  }



  const statData = [
    {
      label: "Overall Attendance",
      value: stats.attendance_percentage,
      subtitle: "Across All Subjects",
      type: "progress",
      icon: CalendarCheck,
      color: "text-success",
      bgColor: "bg-success/10",
      href: "/attendance",
    },
    {
      label: "Subjects Enrolled",
      value: stats.subjects_enrolled,
      subtitle: "This Semester",
      icon: BookOpen,
      color: "text-primary",
      bgColor: "bg-primary/10",
      href: "/results",
    },
    {
      label: "SGPA",
      value: stats.current_sgpa,
      subtitle: "Previous Semester",
      icon: TrendingUp,
      color: "text-success",
      bgColor: "bg-success/10",
      href: "/results",
    },
    {
      label: "Your Rank",
      value: stats.rank,
      subtitle: "From Your Batch",
      icon: Trophy,
      color: "text-warning",
      bgColor: "bg-warning/10",
      href: "/results",
    },
  ];

  const handleClick = (href: string | null) => {
    if (href) {
      navigate(href);
    }
  };


  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statData.map((stat, index) => (
        <div
          key={stat.label}
          className={cn(
            "stat-card animate-slide-up",
            stat.href && "cursor-pointer hover:shadow-md hover:border-primary/20 transition-all"
          )}
          style={{ animationDelay: `${index * 0.1}s` }}
          onClick={() => handleClick(stat.href)}
        >
          {stat.type === "progress" ? (
            <div className="flex flex-col items-center">
              <ProgressRing value={stat.value as number} size={80} />
              <p className="mt-3 text-sm font-medium text-muted-foreground text-center">
                {stat.label}
              </p>
            </div>
          ) : (
            <div className="flex flex-col">
              <div className="flex items-center justify-between">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", stat.bgColor)}>
                  <stat.icon className={cn("w-5 h-5", stat.color)} />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              {stat.subtitle && (
                <p className="text-xs text-muted-foreground/70 mt-0.5">{stat.subtitle}</p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}