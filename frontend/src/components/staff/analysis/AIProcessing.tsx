import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Sparkles, Zap, BarChart3, FileSearch, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { SparkleParticles } from "@/components/ui/sparkle-particles";
interface AIProcessingProps {
  stage: "upload" | "generating";
}
const uploadSteps = [
  { icon: FileSearch, label: "Reading file contents...", duration: 800 },
  { icon: Brain, label: "AI extracting structured data...", duration: 1000 },
  { icon: BarChart3, label: "Identifying columns & patterns...", duration: 800 },
  { icon: CheckCircle2, label: "Data is getting ready for analysis!", duration: 600 },
];
const generateSteps = [
  { icon: Zap, label: "Applying pass/fail criteria...", duration: 800 },
  { icon: Brain, label: "Computing subject-wise analysis...", duration: 1200 },
  { icon: BarChart3, label: "Generating class summaries...", duration: 1000 },
  { icon: Sparkles, label: "Identifying top performers...", duration: 700 },
];
export function AIProcessing({ stage }: AIProcessingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const steps = stage === "upload" ? uploadSteps : generateSteps;
  useEffect(() => {
    setCurrentStep(0);
    setProgress(0);
    
    let stepIdx = 0;
    const advanceStep = () => {
      if (stepIdx < steps.length - 1) {
        stepIdx++;
        setCurrentStep(stepIdx);
        setProgress(Math.round((stepIdx / (steps.length - 1)) * 100));
        setTimeout(advanceStep, steps[stepIdx].duration);
      } else {
        setProgress(100);
      }
    };
    setTimeout(advanceStep, steps[0].duration);
  }, [stage]);
  return (
    <div className="max-w-xl mx-auto animate-fade-in">
      <Card className={cn(
        "relative overflow-hidden border-2 border-violet-500/30",
        "bg-gradient-to-br from-violet-50/80 via-background to-purple-50/80",
        "dark:from-violet-950/40 dark:via-background dark:to-purple-950/40"
      )}>
        <SparkleParticles isActive={true} />
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/0 via-violet-500/5 to-violet-500/0 animate-[shimmer_2s_ease-in-out_infinite]" />
        <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-violet-500/10 via-purple-500/20 to-violet-500/10 blur-xl -z-10 opacity-60" />
        <CardContent className="py-12 px-8 space-y-8 relative">
          {/* Animated brain icon */}
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 rounded-full bg-violet-500/20 animate-ping" style={{ animationDuration: "2s" }} />
            <div className="absolute inset-2 rounded-full bg-violet-500/10 animate-ping" style={{ animationDuration: "2.5s", animationDelay: "0.5s" }} />
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-violet-500/30 to-purple-500/30 flex items-center justify-center shadow-xl shadow-violet-500/25">
              <Brain className="h-11 w-11 text-violet-500 animate-pulse" />
            </div>
          </div>
          {/* Title */}
          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 dark:from-violet-400 dark:to-purple-400 bg-clip-text text-transparent">
              {stage === "upload" ? "AI Processing Your File" : "Generating Analysis Report"}
            </h3>
            <p className="text-sm text-muted-foreground">
              Our AI is working its magic — sit back and relax
            </p>
          </div>
          {/* Progress bar */}
          <div className="space-y-2">
            <Progress
              value={progress}
              className="h-2 bg-violet-100 dark:bg-violet-950/50"
              indicatorClassName="bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-700"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Processing...</span>
              <span className="bg-gradient-to-r from-violet-600 to-purple-600 dark:from-violet-400 dark:to-purple-400 bg-clip-text text-transparent font-semibold">
                {progress}%
              </span>
            </div>
          </div>
          {/* Steps */}
          <div className="space-y-3">
            {steps.map((s, idx) => {
              const Icon = s.icon;
              const isActive = idx === currentStep;
              const isDone = idx < currentStep;
              return (
                <div
                  key={idx}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-500",
                    isActive && "bg-violet-500/10 border border-violet-500/20 shadow-sm",
                    isDone && "opacity-60",
                    !isActive && !isDone && "opacity-30"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500",
                    isActive && "bg-gradient-to-br from-violet-500 to-purple-500 shadow-lg shadow-violet-500/30",
                    isDone && "bg-violet-500/20",
                    !isActive && !isDone && "bg-muted"
                  )}>
                    {isDone ? (
                      <CheckCircle2 className="h-4 w-4 text-violet-500" />
                    ) : (
                      <Icon className={cn(
                        "h-4 w-4",
                        isActive ? "text-white animate-pulse" : "text-muted-foreground"
                      )} />
                    )}
                  </div>
                  <span className={cn(
                    "text-sm font-medium transition-colors duration-300",
                    isActive ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}