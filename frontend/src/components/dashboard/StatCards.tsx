import { 
  CalendarCheck, 
  BookOpen, 
  TrendingUp, 
  ClipboardList
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ProgressRing } from "@/components/dashboard/ProgressRing";
import { cn } from "@/lib/utils";

const stats = [
  {
    label: "Overall Attendance",
    value: 82,
    type: "progress",
    icon: CalendarCheck,
    color: "text-success",
    bgColor: "bg-success/10",
    href: "/attendance",
  },
  {
    label: "Subjects Enrolled",
    value: "4",
    subtitle: "This Semester",
    icon: BookOpen,
    color: "text-primary",
    bgColor: "bg-primary/10",
    href: null,
  },
  {
    label: "Current CGPA",
    value: "6.50",
    subtitle: "Previous: 5.50",
    icon: TrendingUp,
    color: "text-success",
    bgColor: "bg-success/10",
    trend: "+1.00",
    href: "/results",
  },
  {
    label: "Pending Assignments",
    value: "3",
    subtitle: "Due this week",
    icon: ClipboardList,
    color: "text-warning",
    bgColor: "bg-warning/10",
    href: "/materials",
  },
];

export function StatCards() {
  const navigate = useNavigate();

  const handleClick = (href: string | null) => {
    if (href) {
      navigate(href);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
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
                {stat.trend && (
                  <span className="text-xs font-medium text-success bg-success/10 px-2 py-0.5 rounded-full">
                    {stat.trend}
                  </span>
                )}
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
