import { AlertTriangle, CheckCircle, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Backlog } from "@/hooks/useStudentResults";
import { cn } from "@/lib/utils";

interface BacklogsSectionProps {
  backlogs: Backlog[];
}

export function BacklogsSection({ backlogs }: BacklogsSectionProps) {
  const activeBacklogs = backlogs.filter((b) => b.status === "Pending");
  const clearedBacklogs = backlogs.filter((b) => b.status === "Cleared");

  if (activeBacklogs.length === 0) {
    return (
      <div className="bg-success/5 border border-success/20 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-success" />
          </div>
          <div>
            <h3 className="font-semibold text-success">No Active Backlogs</h3>
            <p className="text-sm text-muted-foreground">
              Congratulations! You have cleared all subjects. Keep up the good work!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border shadow-soft overflow-hidden">
      <div className="p-6 border-b border-border bg-destructive/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Active Backlogs</h2>
            <p className="text-sm text-muted-foreground">
              {activeBacklogs.length} subject{activeBacklogs.length > 1 ? "s" : ""} require{activeBacklogs.length === 1 ? "s" : ""} re-examination
            </p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-border">
        {activeBacklogs.map((backlog) => (
          <div
            key={`${backlog.subjectCode}-${backlog.semester}`}
            className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-muted-foreground">
                    {backlog.subjectCode}
                  </span>
                </div>
                <p className="font-medium text-foreground">{backlog.subjectName}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 ml-13 sm:ml-0">
              <Badge
                className={cn(
                  backlog.status === "Pending"
                    ? "bg-destructive/10 text-destructive"
                    : "bg-success/10 text-success"
                )}
              >
                {backlog.status}
              </Badge>
            </div>
          </div>
        ))}
      </div>

      {clearedBacklogs.length > 0 && (
        <div className="p-4 bg-muted/30 border-t border-border">
          <p className="text-sm text-muted-foreground">
            <CheckCircle className="w-4 h-4 inline mr-1 text-success" />
            {clearedBacklogs.length} backlog{clearedBacklogs.length > 1 ? "s" : ""} cleared previously
          </p>
        </div>
      )}
    </div>
  );
}
