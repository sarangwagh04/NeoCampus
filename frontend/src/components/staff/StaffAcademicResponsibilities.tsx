import {
  Bot,
  BarChart3,
  FileText,
  Gamepad2,
  PieChart,
  User,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const responsibilities = [
  {
    label: "Neo AI",
    icon: Bot,
    color: "text-primary",
    bgColor: "bg-primary/10",
    href: "/staff/chatbot",
  },
  {
    label: "Classes and Results",
    icon: BarChart3,
    color: "text-success",
    bgColor: "bg-success/10",
    href: "/staff/results",
  },
  {
    label: "Assignments & Notes",
    icon: FileText,
    color: "text-warning",
    bgColor: "bg-warning/10",
    href: "/staff/materials",
  },
  {
    label: "Stress Buster",
    icon: Gamepad2,
    color: "text-secondary-foreground",
    bgColor: "bg-secondary",
    href: "/staff/stress-buster",
  },
  {
    label: "Result Analysis",
    icon: PieChart,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    href: "/staff/result-analysis",
  },
  {
    label: "My Profile",
    icon: User,
    color: "text-accent-foreground",
    bgColor: "bg-accent",
    href: "/staff/profile",
  },
];

export function StaffAcademicResponsibilities() {
  return (
    <Card className="card-shadow animate-fade-in">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Quick Access</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {responsibilities.map((item, index) => (
            <Link
              key={item.label}
              to={item.href}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-lg border bg-card",
                "hover:bg-muted/50 hover:border-primary/20 transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-primary/20",
                "animate-scale-in"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div
                className={cn(
                  "w-12 h-12 rounded-lg flex items-center justify-center",
                  item.bgColor
                )}
              >
                <item.icon className={cn("w-6 h-6", item.color)} />
              </div>
              <span className="text-sm font-medium text-foreground text-center">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
