import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Sparkles, CheckCircle2, XCircle, Brain, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { SparkleParticles } from "@/components/ui/sparkle-particles";
import type { ValueMapping } from "@/hooks/useAIResultAnalysis";
interface AIValueMappingProps {
  columnName: string;
  valueMappings: ValueMapping[];
  onUpdateMapping: (value: string, status: "pass" | "fail" | null) => void;
  allMapped: boolean;
  onGenerate: () => void;
  onBack: () => void;
}
export function AIValueMapping({
  columnName,
  valueMappings,
  onUpdateMapping,
  allMapped,
  onGenerate,
  onBack,
}: AIValueMappingProps) {
  const totalStudents = valueMappings.reduce((sum, m) => sum + m.count, 0);
  const passCount = valueMappings.filter(m => m.status === "pass").reduce((sum, m) => sum + m.count, 0);
  const failCount = valueMappings.filter(m => m.status === "fail").reduce((sum, m) => sum + m.count, 0);
  return (
    <div className="space-y-6 animate-fade-in">
      <Button variant="ghost" onClick={onBack} className="mb-2">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back — Change Column
      </Button>
      <Card className={cn(
        "relative overflow-hidden border-2 border-violet-500/30 transition-all duration-500",
        "bg-gradient-to-br from-violet-50/80 via-background to-purple-50/80",
        "dark:from-violet-950/40 dark:via-background dark:to-purple-950/40"
      )}>
        <SparkleParticles isActive={allMapped} />
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/0 via-violet-500/5 to-violet-500/0 animate-[shimmer_3s_ease-in-out_infinite]" />
        <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-violet-500/10 via-purple-500/20 to-violet-500/10 blur-xl -z-10 opacity-40" />
        <CardHeader className="relative">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/30 to-purple-500/30 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Brain className="h-6 w-6 text-violet-500" />
            </div>
            <div>
              <CardTitle className="text-lg bg-gradient-to-r from-violet-600 to-purple-600 dark:from-violet-400 dark:to-purple-400 bg-clip-text text-transparent">
                Define Pass / Fail Criteria
              </CardTitle>
              <CardDescription>
                Column: <Badge variant="outline" className="ml-1 border-violet-400/50 text-violet-600 dark:text-violet-400">{columnName}</Badge> — 
                Mark each unique value as Pass or Fail
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 relative">
          {/* Live summary */}
          {(passCount > 0 || failCount > 0) && (
            <div className="grid grid-cols-3 gap-3 animate-fade-in">
              <div className="rounded-xl bg-muted/50 p-3 text-center">
                <p className="text-2xl font-bold text-foreground">{totalStudents}</p>
                <p className="text-xs text-muted-foreground">Total Students</p>
              </div>
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-center">
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{passCount}</p>
                <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70">Will Pass</p>
              </div>
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-center">
                <p className="text-2xl font-bold text-destructive">{failCount}</p>
                <p className="text-xs text-destructive/70">Will Fail</p>
              </div>
            </div>
          )}
          {/* Value cards */}
          <div className="space-y-3">
            {valueMappings.map((mapping) => (
              <div
                key={mapping.value}
                className={cn(
                  "flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-300",
                  mapping.status === "pass"
                    ? "border-emerald-500/40 bg-emerald-500/5"
                    : mapping.status === "fail"
                      ? "border-red-500/40 bg-red-500/5"
                      : "border-border bg-card hover:border-violet-300/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm transition-all duration-300",
                    mapping.status === "pass"
                      ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                      : mapping.status === "fail"
                        ? "bg-red-500/20 text-destructive"
                        : "bg-violet-500/10 text-violet-500"
                  )}>
                    {mapping.count}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{mapping.value}</p>
                    <p className="text-xs text-muted-foreground">
                      {mapping.count} student{mapping.count !== 1 ? "s" : ""} ({((mapping.count / totalStudents) * 100).toFixed(1)}%)
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={mapping.status === "pass" ? "default" : "outline"}
                    className={cn(
                      "transition-all duration-300",
                      mapping.status === "pass"
                        ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25"
                        : "hover:border-emerald-500/50 hover:text-emerald-600"
                    )}
                    onClick={() => onUpdateMapping(mapping.value, mapping.status === "pass" ? null : "pass")}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                    Pass
                  </Button>
                  <Button
                    size="sm"
                    variant={mapping.status === "fail" ? "default" : "outline"}
                    className={cn(
                      "transition-all duration-300",
                      mapping.status === "fail"
                        ? "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25"
                        : "hover:border-red-500/50 hover:text-destructive"
                    )}
                    onClick={() => onUpdateMapping(mapping.value, mapping.status === "fail" ? null : "fail")}
                  >
                    <XCircle className="h-3.5 w-3.5 mr-1" />
                    Fail
                  </Button>
                </div>
              </div>
            ))}
          </div>
          {/* Generate button */}
          <Button
            className={cn(
              "w-full transition-all duration-500",
              allMapped
                ? "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-xl shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-[1.01]"
                : "bg-muted text-muted-foreground"
            )}
            size="lg"
            disabled={!allMapped}
            onClick={onGenerate}
          >
            {allMapped ? (
              <>
                <Zap className="h-4 w-4 mr-2 animate-pulse" />
                Generate AI Analysis Report
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Map all values to continue
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}