import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ProgressRing } from "@/components/dashboard/ProgressRing";
import { cn } from "@/lib/utils";

interface OverallAttendanceCardProps {
  percentage: number;
  isLoading: boolean;
  error: Error | null;
}

export function OverallAttendanceCard({
  percentage,
  isLoading,
  error,
}: OverallAttendanceCardProps) {
  const getStatus = () => {
    if (percentage >= 75) {
      return {
        status: "safe",
        message: "You are eligible for exams",
        icon: CheckCircle,
        colorClass: "text-success",
        bgClass: "bg-success/10",
      };
    }
    if (percentage >= 65) {
      return {
        status: "warning",
        message: "Attendance nearing threshold. Improve to stay eligible.",
        icon: AlertTriangle,
        colorClass: "text-warning",
        bgClass: "bg-warning/10",
      };
    }
    return {
      status: "danger",
      message: "Attendance below required threshold. Risk of exam ineligibility.",
      icon: XCircle,
      colorClass: "text-destructive",
      bgClass: "bg-destructive/10",
    };
  };

  if (error) {
    return (
      <Card className="border-destructive/20 bg-destructive/5">
        <CardContent className="flex items-center gap-4 p-6">
          <XCircle className="h-10 w-10 text-destructive" />
          <div>
            <h3 className="font-semibold text-destructive">
              Unable to load attendance data
            </h3>
            <p className="text-sm text-muted-foreground">
              Please try again later or contact support if the issue persists.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-6 p-8 md:flex-row md:justify-between">
          <div className="flex items-center gap-6">
            <Skeleton className="h-32 w-32 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <Skeleton className="h-12 w-40 rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  const { message, icon: Icon, colorClass, bgClass } = getStatus();

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col items-center gap-6 p-6 md:flex-row md:p-8">
          {/* Progress Ring */}
          <div className="flex-shrink-0">
            <ProgressRing value={percentage} size={128} strokeWidth={12} />
          </div>

          {/* Info Section */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-lg font-semibold text-foreground">
              Overall Attendance
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Based on all subjects in the current semester
            </p>

            {/* Status Badge */}
            <div
              className={cn(
                "mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2",
                bgClass
              )}
            >
              <Icon className={cn("h-5 w-5", colorClass)} />
              <span className={cn("text-sm font-medium", colorClass)}>
                {message}
              </span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex gap-6 md:flex-col md:gap-2 md:text-right">
            <div>
              <p className="text-2xl font-bold text-foreground">{percentage}%</p>
              <p className="text-xs text-muted-foreground">Current</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-muted-foreground">75%</p>
              <p className="text-xs text-muted-foreground">Required</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
