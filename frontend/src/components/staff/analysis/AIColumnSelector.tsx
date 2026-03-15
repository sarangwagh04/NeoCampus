import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Brain, Sparkles, Columns, Database, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { SparkleParticles } from "@/components/ui/sparkle-particles";
import type { ParsedData } from "@/hooks/useAIResultAnalysis";
interface AIColumnSelectorProps {
  parsedData: ParsedData;
  onSelectColumn: (column: string) => void;
  onBack: () => void;
}
export function AIColumnSelector({ parsedData, onSelectColumn, onBack }: AIColumnSelectorProps) {
  const [hoveredCol, setHoveredCol] = useState<string | null>(null);
  const [selectedCol, setSelectedCol] = useState<string | null>(null);
  return (
    <div className="space-y-6 animate-fade-in">
      <Button variant="ghost" onClick={onBack} className="mb-2">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back — Re-upload File
      </Button>
      <Card className={cn(
        "relative overflow-hidden border-2 border-violet-500/30 transition-all duration-500",
        "bg-gradient-to-br from-violet-50/80 via-background to-purple-50/80",
        "dark:from-violet-950/40 dark:via-background dark:to-purple-950/40"
      )}>
        <SparkleParticles isActive={!!hoveredCol} />
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/0 via-violet-500/5 to-violet-500/0 animate-[shimmer_3s_ease-in-out_infinite]" />
        <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-violet-500/10 via-purple-500/20 to-violet-500/10 blur-xl -z-10 opacity-40" />
        <CardHeader className="relative">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/30 to-purple-500/30 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Columns className="h-6 w-6 text-violet-500" />
            </div>
            <div>
              <CardTitle className="text-lg bg-gradient-to-r from-violet-600 to-purple-600 dark:from-violet-400 dark:to-purple-400 bg-clip-text text-transparent">
                Select Pass/Fail Criteria Column
              </CardTitle>
              <CardDescription>
                AI found <span className="font-semibold text-violet-500">{parsedData.columns.length} columns</span> and <span className="font-semibold text-violet-500">{parsedData.totalRows} rows</span> in your data. Choose which column defines pass/fail.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 relative">
          {/* Data summary */}
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-violet-500/5 border border-violet-500/10">
            <Database className="h-4 w-4 text-violet-500" />
            <span className="text-sm text-muted-foreground">
              Parsed <span className="font-semibold text-foreground">{parsedData.totalRows}</span> student records with <span className="font-semibold text-foreground">{parsedData.columns.length}</span> data columns
            </span>
          </div>
          {/* Column grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {parsedData.columns.map((col) => {
              const isSelected = selectedCol === col.name;
              const isHovered = hoveredCol === col.name;
              return (
                <button
                  key={col.name}
                  onClick={() => setSelectedCol(col.name)}
                  onMouseEnter={() => setHoveredCol(col.name)}
                  onMouseLeave={() => setHoveredCol(null)}
                  className={cn(
                    "relative text-left p-4 rounded-xl border-2 transition-all duration-300 group",
                    isSelected
                      ? "border-violet-500 bg-violet-500/10 shadow-lg shadow-violet-500/15 scale-[1.01]"
                      : isHovered
                        ? "border-violet-400/50 bg-violet-500/5 shadow-md"
                        : "border-border hover:border-violet-300/50"
                  )}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                        <Sparkles className="h-3 w-3 text-white" />
                      </div>
                    </div>
                  )}
                  <p className={cn(
                    "font-semibold text-sm transition-colors",
                    isSelected ? "text-violet-600 dark:text-violet-400" : "text-foreground"
                  )}>
                    {col.name}
                  </p>
                  {/* Sample values */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {col.sampleValues.slice(0, 4).map((val, i) => (
                      <Badge
                        key={i}
                        variant="outline"
                        className={cn(
                          "text-xs transition-colors",
                          isSelected
                            ? "border-violet-400/50 text-violet-600 dark:text-violet-400"
                            : "text-muted-foreground"
                        )}
                      >
                        {val}
                      </Badge>
                    ))}
                    {col.sampleValues.length > 4 && (
                      <Badge variant="outline" className="text-xs text-muted-foreground">
                        +{col.sampleValues.length - 4}
                      </Badge>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          {/* Proceed button */}
          <Button
            className={cn(
              "w-full transition-all duration-300",
              selectedCol
                ? "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.01]"
                : "bg-muted text-muted-foreground"
            )}
            size="lg"
            disabled={!selectedCol}
            onClick={() => selectedCol && onSelectColumn(selectedCol)}
          >
            <ChevronRight className="h-4 w-4 mr-2" />
            Proceed with "{selectedCol || "..."}" column
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}