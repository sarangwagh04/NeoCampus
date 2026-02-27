import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TeachingPlan } from "@/hooks/useTimetableData";
import { BookOpen, ChevronDown, ChevronUp, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface TeachingPlanSectionProps {
  plans: TeachingPlan[];
  isLoading: boolean;
}

function getProgressStatus(completed: number, planned: number) {
  const progress = (completed / planned) * 100;
  if (progress < 50) return "early"; // Early stage
  if (progress < 80) return "mid"; // Midway
  return "near"; // Near completion
}

function getProgressColor(status: string) {
  switch (status) {
    case "early":
      return "bg-success";
    case "mid":
      return "bg-warning";
    case "near":
      return "bg-destructive";
    default:
      return "bg-primary";
  }
}

function TeachingPlanCard({ plan }: { plan: TeachingPlan }) {
  const [isOpen, setIsOpen] = useState(false);
  const progress = (plan.lecturesCompleted / plan.lecturesPlanned) * 100;
  const status = getProgressStatus(plan.lecturesCompleted, plan.lecturesPlanned);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="stat-card overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                <CardTitle className="text-base font-semibold text-foreground">
                  {plan.subjectName}
                </CardTitle>
              </div>
              <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                <User className="w-3 h-3" />
                <span>{plan.facultyName}</span>
              </div>
            </div>
            <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
              {plan.subjectCode}
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="text-muted-foreground">Syllabus Progress</span>
                <span className="font-semibold text-foreground">
                  {plan.lecturesCompleted} / {plan.lecturesPlanned}
                </span>
              </div>
              <Progress
                value={progress}
                className="h-2"
                indicatorClassName={getProgressColor(status)}
              />
            </div>

            <div className="flex items-center justify-between">
              <span
                className={cn(
                  "text-sm font-medium px-2 py-0.5 rounded-full",
                  status === "early" && "bg-success/10 text-success",
                  status === "mid" && "bg-warning/10 text-warning",
                  status === "near" && "bg-destructive/10 text-destructive"
                )}
              >
                {plan.lecturesRemaining} lectures remaining
              </span>

              {plan.topics && plan.topics.length > 0 && (
                <CollapsibleTrigger asChild>
                  <button className="flex items-center gap-1 text-xs text-primary hover:underline">
                    {isOpen ? (
                      <>
                        <ChevronUp className="w-3 h-3" />
                        <span>Hide Topics</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3 h-3" />
                        <span>View Topics</span>
                      </>
                    )}
                  </button>
                </CollapsibleTrigger>
              )}
            </div>

            <CollapsibleContent>
              {plan.topics && (
                <div className="pt-3 border-t border-border mt-2 space-y-2">
                  {plan.topics.map((topic, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "w-2 h-2 rounded-full",
                            topic.completed ? "bg-success" : "bg-muted-foreground/30"
                          )}
                        />
                        <span
                          className={cn(
                            topic.completed
                              ? "text-muted-foreground line-through"
                              : "text-foreground"
                          )}
                        >
                          {topic.name}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {topic.lectures} lectures
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CollapsibleContent>
          </div>
        </CardContent>
      </Card>
    </Collapsible>
  );
}

function TeachingPlanSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i} className="stat-card">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-6 w-12" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-2 w-full mb-3" />
            <Skeleton className="h-6 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function TeachingPlanSection({ plans, isLoading }: TeachingPlanSectionProps) {
  if (isLoading) {
    return (
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Teaching Plan Overview</h2>
        </div>
        <TeachingPlanSkeleton />
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Teaching Plan Overview</h2>
        </div>
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Teaching plan not available</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="mt-8 animate-slide-up">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Teaching Plan Overview</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <TeachingPlanCard key={plan.subjectCode} plan={plan} />
        ))}
      </div>
    </div>
  );
}
