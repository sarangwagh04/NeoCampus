import { TrendingUp, Users, BarChart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ClassPerformance } from "@/hooks/useStaffResultUpload";
import { cn } from "@/lib/utils";

interface StaffClassInsightsProps {
  performance: ClassPerformance[] | null;
  isLoading: boolean;
}

export interface ClassPerformance {
  batch: string;
  averageAttendance: number;
  averageScore: number;
}

function getColorClass(value: number) {
  if (value >= 80) return "bg-success";
  if (value >= 65) return "bg-warning";
  return "bg-destructive";
}

export function StaffClassInsights({ performance, isLoading }: StaffClassInsightsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!performance) return null;

  return (
    <Card className="card-shadow animate-fade-in">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <BarChart className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg font-semibold">Class Performance</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {performance.map((item, index) => (
          <div
            key={item.batch}
            className="p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <h4 className="font-medium text-foreground mb-3">{item.batch}</h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  Avg. Attendance
                </span>
                <span className="font-medium">{item.averageAttendance}%</span>
              </div>
              <Progress
                value={item.averageAttendance}
                className="h-2"
                indicatorClassName={getColorClass(item.averageAttendance)}
              />

              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Avg. Score
                </span>
                <span className="font-medium">{item.averageScore}%</span>
              </div>
              <Progress
                value={item.averageScore}
                className="h-2"
                indicatorClassName={getColorClass(item.averageScore)}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
